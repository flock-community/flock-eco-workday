# Authentication

How the mobile app (and, in future, the web app) signs in to workday via Ory Hydra.

> The phone never gets a workday password. It gets a **signed token** from a central
> login server (Hydra). Workday's job is to **trust that signature**, then figure out
> **which workday user** the token belongs to. That second part — matching a token to a
> local account — is the only genuinely new logic here.

The components:

| | |
|---|---|
| **flock-app** | the mobile client (the phone) |
| **Hydra** | OAuth2 / token issuer |
| **Kratos** | the actual login (Google, etc.) — identifies users by a stable UUID |
| **workday** | this backend; an OAuth2 resource server |

## The whole flow, once

A user taps "Sign in" once. Everything below happens; from then on the phone just
replays step 6 with a stored token (refreshing silently when it expires).

1. **phone** — generates a one-time secret (`code_verifier`) and opens the system
   browser at Hydra's `/oauth2/auth`. (PKCE: only the app that started the flow can
   finish it; the browser's cookies never leak into the app.)
2. **Kratos** — Hydra hands the browser to Kratos, which shows the login page. User
   authenticates with Google. Kratos identifies the user by a stable UUID — this becomes
   the token's `sub` claim.
3. **Hydra** — redirects back to `community.flock.app://oauth/callback?code=…`; the OS
   routes that custom URL to the app.
4. **Hydra** — app swaps the `code` + its secret at `/oauth2/token` and receives a
   **JWT access token** (+ refresh + id token), signed by Hydra with a key anyone can
   verify but nobody can forge.
5. **phone** — stores the tokens securely (Keychain / EncryptedSharedPreferences).
6. **phone** — calls workday, e.g. `POST /api/expenses-cost` with header
   `Authorization: Bearer <JWT>`.
7. **workday** — Spring verifies the JWT signature against Hydra's public keys
   (downloaded once, cached). No call to Hydra per request. This is stock Spring
   Security — `oauth2ResourceServer().jwt()`.
8. **workday** — our code takes over: read `sub` from the verified token, resolve it to
   a workday `User` (see below), then proceed exactly as any other logged-in user.

Workday doesn't store mobile passwords, doesn't talk to Google, and doesn't phone Hydra
on every request — it just checks a signature. The same chain works for a future web
app, so this isn't a mobile-only hack.

## Step 8 — the one piece of custom logic

The token proves *"some valid Kratos identity `sub` is calling."* It does **not** say
which workday user that is — Hydra and Kratos have never heard of workday's user table.
So we resolve it, cheapest path first, and persist the answer
(`KratosIdentityUserResolver`):

1. **Database** — `findByKratosIdentityId(sub)`, a unique indexed column.
   Hit → done. This column *is* the cache: sub-millisecond, survives restarts, no
   in-memory layer.
2. **Ask Hydra who this is** — only the first time ever for this identity.
   `GET /userinfo` with the same token returns `email` + name claims. Happens at most
   **once per identity, ever** (after which step 1 always hits). If Hydra is unreachable
   here → **503**, not 401.
3. **Match or create by email**
   - Email already exists (e.g. a long-time Google-web user) → stamp
     `kratos_identity_id = sub` onto that row. They're now linked.
   - No such email → create a new `User` (named from the `given_name` / `family_name`
     claims), then link it.

The `kratos_identity_id` column (Liquibase migration 027, nullable + unique) is the
permanent join. After the first sign-in, every later request stops at step 1 — Hydra is
never called again for that user.

**Hydra vouches for the person; workday decides what that person is allowed to do.** The
"who is this locally?" lookup self-populates as people sign in for the first time — no
migration script, no manual linking.

## What is ours vs. framework

| File | Does | Weight |
|---|---|---|
| `WebSecurityConfig.kt` | Adds one `oauth2ResourceServer { jwt {} }` block, guarded so test profiles skip it. | ~6 lines |
| `HydraJwtAuthenticationConverter.kt` | Verified JWT → `sub` → resolver → emit the same principal every other login path emits. | thin |
| `KratosIdentityUserResolver.kt` | The 3-step resolution above + a dedicated timed HTTP client for `/userinfo`. | the bulk |
| `HydraAuthenticationEntryPoint.kt` | Maps "Hydra unreachable" to **503**; everything else falls through to the standard 401. | ~25 lines |
| `HydraIssuerConfigured.kt` | Switches all the above off when no issuer is configured (tests). | 18 lines |
| `User.kt` / `UserService` / repo | New `kratosIdentityId` field, `findByKratosIdentityId`, `linkKratosIdentity`. | tiny |
| migration 027 | Adds the nullable unique join column. | 15 lines |

### How it leans on Spring Security

Adding `spring-boot-starter-oauth2-resource-server` and the `oauth2ResourceServer { jwt {} }`
DSL turns on a fully-assembled pipeline; we plug into two extension points and set one
property:

| Element | Owner |
|---|---|
| `JwtDecoder` — OIDC discovery from `issuer-uri`, JWKS fetch + cache, RS256 signature + `iss`/`exp`/`nbf` validation | Spring (auto-config) |
| `BearerTokenAuthenticationFilter` — reads `Authorization: Bearer …` | Spring |
| `JwtAuthenticationProvider` — runs the decoder, hands the verified `Jwt` to our converter | Spring |
| `Converter<Jwt, AbstractAuthenticationToken>` — `sub` → workday `User` → principal | **ours** (`HydraJwtAuthenticationConverter`) |
| `AuthenticationEntryPoint` — what to return when auth fails | **ours**, only to add the 503 case; delegates to Spring's `BearerTokenAuthenticationEntryPoint` otherwise |
| `@EnableMethodSecurity` + `@Secured` on controllers | Spring — unchanged, works because we emit the same principal |

The JWT chain is added to the *same* `SecurityFilterChain` that already runs Google
`oauth2Login` and the API-key filter — they coexist, each recognising its own kind of
credential, all funnelling to one principal shape (`user.code` as the name).

## Reusing this for the web / React frontend

A future migration of the web app off Spring's Google login onto Ory can reuse the
valuable half of this work unchanged:

| Piece | Web migration |
|---|---|
| `KratosIdentityUserResolver` + `kratos_identity_id` column + `linkKratosIdentity` | **reuse as-is** — mapping a Kratos `sub` → workday `User` is identical regardless of transport. This is the asset. |
| The uniform principal contract (`user.code` as the name) | **reuse** — controllers and `@Secured` don't change no matter the front door. |
| `User` entity / repo / service additions | **reuse** — shared by any path. |
| `oauth2ResourceServer().jwt()` + the `/userinfo` RestClient | **replace** — bearer-token plumbing for a native app. A browser on the same origin uses a session, not a per-request `Bearer` header. |

The browser would authenticate one of two ways, and the resolver feeds both:

1. **Spring `oauth2Login` against Hydra** — swap the Google OIDC registration for Hydra
   (confidential client, server keeps the session). Spring fetches the id_token during
   the code exchange, so the resolver is called from the login *success handler* with
   claims in hand — no separate `/userinfo` hop on the web path.
2. **Ory Oathkeeper `cookie_session`** in front — Oathkeeper validates the Kratos cookie
   and forwards identity headers; workday trusts a header and calls the same resolver.

The lazy link-by-email step (resolution step 3) *is* the web cutover: today's Google-web
users resolve via their Google `sub`; under Kratos the `sub` becomes the Kratos identity
UUID. On a user's first Ory login their existing row gets `kratos_identity_id` stamped —
no data backfill, no manual relink.

## See also

- [ADR 0001 — Hydra JWT resource server + Kratos identity resolution](adr/0001-hydra-jwt-resource-server-kratos-identity-resolution.md) — the decision and its rationale.
- The mobile-side decision lives in flock-app: `docs/adr/0003-mobile-auth-via-hydra-pkce.md`.
