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
> Retroactive-STRIDE mode: no plan-time threat register existed; threats constructed from implementation.

---

## Scope

Single-line change in `EventAllocationListItem.tsx`:

```diff
- href="/event"
+ href={`/event?code=${eventCode}`}
```

`eventCode` is a `string` prop derived from `BudgetAllocation.eventCode`, which is populated from the
API response. The value is generated server-side as `UUID.randomUUID().toString()` (see
`EventService.kt:189`). The link is only rendered for `isAdmin === true` users (line 149).

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| API → Browser | `BudgetAllocation.eventCode` received from authenticated REST endpoint | UUID string, read-only |
| Browser → Browser | Client-side `<a href>` navigation to `/event?code=<uuid>` | UUID query param, same origin |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| T-16-01 | Spoofing | `/event` page auth | accept | Auth on destination page is a platform-wide control; unchanged by this phase | closed |
| T-16-02 | Tampering | `EventAllocationListItem` | accept | No write path introduced; `href` is client-side navigation only | closed |
| T-16-03 | Repudiation | `EventAllocationListItem` | accept | No mutation or action introduced; read-only navigation link | closed |
| T-16-04 | Information Disclosure | `eventCode` in URL | accept | `eventCode` is already present in the API response the authenticated user's browser received; placing it in the URL does not expose it to new principals | closed |
| T-16-05 | Denial of Service | Frontend render | accept | No server-side change; purely frontend string interpolation | closed |
| T-16-06 | Elevation of Privilege | `isAdmin` gate | accept | `EventAllocationListItem.tsx:149` — `<Link>` only rendered when `isAdmin === true`; link carries no privilege grant | closed |
| T-16-07 | XSS / Open Redirect via href injection | `<Link href>` interpolation | accept | `eventCode` is UUID-shaped (hex + hyphens, `UUID.randomUUID()` at `EventService.kt:189`); cannot contain `javascript:` scheme or path separators. No free-text user input reaches this field. Risk accepted: data is origin- and format-constrained. See Accepted Risks Log. | closed |

*Status: open · closed*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-16-01 | T-16-07 | `eventCode` interpolated into `<a href>` without explicit `javascript:` sanitization. Accepted because the value is UUID-shaped (generated via `UUID.randomUUID().toString()` server-side, `EventService.kt:189`), flows through a typed wirespec contract (`eventCode: String?` in `budget-allocations.ws`), and is never populated from free-form user text input. React does not sanitize `href` values, but the data source structurally precludes injection. If eventCode sourcing changes to allow user-supplied values in future, this risk must be re-evaluated and explicit sanitization added. | gsd-security-auditor | 2026-05-22 |

---

## Unregistered Flags

None — SUMMARY.md contains no `## Threat Flags` section; executor reported no new attack surface.

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
