# ADR 0001 — Mobile auth via Kratos session-token introspection (MVP)

- **Status:** Accepted
- **Date:** 2026-05-19
- **Scope:** The forthcoming Kotlin Multiplatform mobile app (Android + iOS) authenticating against the workday backend.
- **Related (in the [`flock-app`](https://github.com/flock-community/flock-app) repo):** [mobile-mvp-plan.md](https://github.com/flock-community/flock-app/blob/main/docs/mobile-mvp-plan.md) — W1 (backend filter, this ADR) is one of three workstreams; the other two (Wirespec upstream PR, mobile repo MVP) live there.

## Context

The production web auth stack uses Ory Oathkeeper in front of the workday Spring Boot service, with Oathkeeper terminating session-cookie auth against Ory Kratos (hosted on Ory Network at `auth.flock.community`; the older `accounts.flock.community` host's TLS cert has expired and may be retired). The Spring Security `googleLogin` path in `WebSecurityConfig.kt` / `UserSecurityService.kt` is a direct-deploy / local-dev convenience and is not the production trust boundary.

The Kratos deployment exposes a single sign-in method: Google OIDC. Probing `auth.flock.community/self-service/login/api` confirms this is the only configured `oidc` provider; there is no password or passwordless method.

For the mobile app, three integration patterns were considered:

- **Pure-native Kratos API flow.** Blocked: Kratos's `oidc:google` submission completes via a Google OAuth redirect that a JSON HTTP client cannot follow without a browser. (Could become viable later if Kratos is reconfigured to accept native Google ID-token submission — out of our control today.)
- **In-app authentication session** via `ASWebAuthenticationSession` / Chrome Custom Tabs, with deep-link callback returning a Kratos session token. Works today against the as-configured Kratos with no help from anyone outside this repo.
- **Direct-to-Google + custom backend endpoint** (issue our own API keys). Rejected: `auth.flock.community` is the current auth provider for the Flock ecosystem, and bypassing Kratos would fragment Flock-wide SSO.

For backend acceptance of the resulting Kratos session token, three options were considered:

- **(i) Route mobile traffic through Oathkeeper** with a new `bearer_token` rule. Cleanest production-shape, but requires changes to `terraform/oathkeeper/rules.yaml` and a deploy.
- **(ii) Validate Kratos session tokens directly in the workday backend** via a new filter that calls `auth.flock.community/sessions/whoami` with the bearer token. Self-contained inside this repo.
- **(iii) Trust an Oathkeeper-injected JWT** (the `id_token` mutator is already configured in `terraform/oathkeeper/config.yaml`). Long-term goal, but requires both an Oathkeeper rule change and new JWT-validation code in Spring Security.

## Decision

**MVP:** In-app authentication session on the device + option (ii) on the backend.

- The KMP app opens `https://auth.flock.community/...` in an in-app authentication session (`ASWebAuthenticationSession` on iOS, Chrome Custom Tabs on Android), completes the Kratos browser flow, captures the returned Kratos session token via a deep-link callback, and stores it in Keychain / EncryptedSharedPreferences.
- The app sends `Authorization: Bearer <kratos-session-token>` on every API request.
- A new `KratosSessionFilter` in `workday-application/.../config/` reads the bearer token, calls Kratos `sessions/whoami` (with explicit connect/read timeouts so a slow Kratos cannot pin Tomcat threads, and a bounded LRU cache — positive ~60s, negative ~10s — to absorb token-spray without hammering Kratos), and resolves the Kratos identity to a workday `User` via `userService.findByEmail(traits.email)` — creating the `User` if missing. It then populates the Spring `SecurityContext` with a `UsernamePasswordAuthenticationToken(user.code, null, user.getGrantedAuthority())`, matching the pattern used by the existing `UserKeyTokenFilter`.
- **The filter does not touch `UserAccountOauth`.** Its mapping (Google `sub` → user) remains the responsibility of the legacy `UserSecurityService.googleLogin` path. A mobile-first user will get a `User` row but no `UserAccountOauth` row; if they later log in via web, the existing `googleLogin` code finds the user by email and backfills the oauth row.
- Rationale for avoiding `UserSecurityOauth2`: it wraps an `OidcIdToken`, which Kratos `sessions/whoami` does not provide. Constructing a synthetic token would be misleading.
- The existing `WebSecurityConfig` filter chain remains; the new filter is added alongside `UserKeyTokenFilter`.

**Post-MVP (option iii):** migrate to Oathkeeper-fronted bearer-token auth with the workday backend validating the Oathkeeper-injected JWT against `terraform/oathkeeper/jwks/jwks.json`. This removes the per-request `sessions/whoami` round-trip and aligns mobile + web on a single trust model. Tracked as a follow-up; not in MVP scope.

## Consequences

- The workday backend gains a hard runtime dependency on `auth.flock.community` reachability. A 60-second cache softens this but does not eliminate it; if Kratos is down, no mobile request authenticates.
- New backend code becomes Kratos-aware. The post-MVP migration to (iii) will need to remove that coupling.
- The expired TLS cert on `accounts.flock.community` is referenced in `terraform/oathkeeper/config.yaml:100` but is not on the MVP path. It still needs to be resolved separately (web prod risk).
- Pure-native login (no in-app authentication session) is deferred. If product wants this later, Kratos config must change (enable native OIDC ID-token submission) or a non-OIDC method must be added; neither is in this repo's control.

## Alternatives considered (and why not now)

See Context for the full enumeration. Pure-native was preferred on aesthetic grounds (pattern "B"); rejected for MVP because the Kratos config does not support it today. Oathkeeper-fronted JWT (iii) is strictly better long-term but adds setup friction with no MVP user-visible benefit.
