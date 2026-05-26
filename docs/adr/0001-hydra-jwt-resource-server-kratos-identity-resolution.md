# ADR 0001 — Hydra JWT resource server + Kratos identity resolution

**Status:** Accepted · **Date:** 2026-05-26

## Context

The mobile app (flock-app) needs to call the workday API on a user's behalf without ever
holding a workday password. Users authenticate centrally via Ory (Kratos for login,
Hydra for OAuth2), which issues a signed JWT. Workday must accept that token and map it
to a local `User` — but Hydra and Kratos know nothing of workday's user table.

## Decision

Make workday an **OAuth2 resource server** that validates Hydra-issued JWTs with stock
Spring Security (`oauth2ResourceServer { jwt {} }`), and resolve the token's `sub`
(Kratos identity UUID) to a workday `User` ourselves:

1. Look up by `kratos_identity_id` (unique indexed column — the cache).
2. On first sight only, `GET /userinfo` for the email + name claims.
3. Match an existing user by email and stamp `kratos_identity_id`, or create one.

The JWT chain joins the existing `SecurityFilterChain` (Google `oauth2Login`, API key)
and emits the same principal, so authorization (`@Secured`) is unchanged.

## Alternatives considered

- **Session/cookie filter for bearer tokens** (the earlier draft, PR #488) — rejected:
  reinvents what Spring's resource-server pipeline already does, and signature
  verification per request is free without it.
- **Opaque tokens + introspection** — rejected: a network hop to Hydra on every request;
  JWT signature checks need none.
- **Pre-provisioning / backfill of identity links** — rejected: lazy link-by-email
  self-populates with no migration script.

## Consequences

- Signature verification is owned by Spring; we maintain only the `sub` → `User` mapping.
- Hydra is called at most once per identity (first sign-in); afterwards lookups are a DB
  hit. If Hydra is unreachable during that first call, requests get **503**, not 401.
- The resolver, `kratos_identity_id` column, and principal contract carry over to a
  future web-frontend Ory migration; only the bearer-token front door would be swapped
  for a session-based one.

See [authentication.md](../authentication.md) for the full flow and file-level detail.
