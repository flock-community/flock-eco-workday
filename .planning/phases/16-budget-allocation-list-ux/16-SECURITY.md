---
phase: 16
slug: budget-allocation-list-ux
status: verified
threats_open: 0
asvs_level: 1
created: 2026-05-22
---

# Phase 16 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| Browser → React client | Client-side navigation via MUI Link `href` | `eventCode` (UUID, internal reference) |
| API → Component | Budget allocation data fetched by authenticated user | `eventCode` string, read-only |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| T-16-01 | Spoofing | `/event` route | accept | Auth on destination is a platform-wide control, unchanged by this phase | closed |
| T-16-02 | Tampering | EventAllocationListItem href | accept | No write path introduced; `href` is client-side navigation only | closed |
| T-16-03 | Repudiation | EventAllocationListItem | accept | No mutation introduced; read-only link change | closed |
| T-16-04 | Information Disclosure | URL query param `?code=` | accept | `eventCode` already in authenticated user's API response; URL placement does not expose to new principals | closed |
| T-16-05 | Denial of Service | Frontend | accept | No server-side change introduced | closed |
| T-16-06 | Elevation of Privilege | EventAllocationListItem `<Link>` | accept | Link rendered only when `isAdmin === true` (line 149); carries no privilege grant | closed |
| T-16-07 | XSS / Open Redirect via href injection | EventAllocationListItem href | accept (AR-16-01) | `eventCode` is `UUID.randomUUID()` server-generated; hex+hyphens only, cannot carry `javascript:` scheme. Wirespec contract enforces `String?`. See accepted risk AR-16-01. | closed |

*Status: open · closed*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-16-01 | T-16-07 | React does not sanitize `href` values and will render `javascript:` URIs. Risk is closed because `eventCode` is UUID-shaped by construction (server-generated via `UUID.randomUUID()`, never user-supplied free text). **Re-evaluate if `eventCode` sourcing changes** (e.g. admin-entered slugs → must add `encodeURIComponent` + scheme allowlist). | gsd-security-auditor | 2026-05-22 |

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-05-22 | 7 | 7 | 0 | gsd-security-auditor (retroactive-STRIDE) |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-05-22
