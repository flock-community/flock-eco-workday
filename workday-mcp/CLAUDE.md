# workday-mcp

A **local** [MCP](https://modelcontextprotocol.io) server (stdio) that exposes
flock-eco-workday functionality to an MCP client such as Claude. It is a thin wrapper over the
existing Workday REST API — it adds no business logic of its own. Tooling covers expenses and the
work / sick / leave hours flows, and grows from there (see Tools below).

**Topology:** the MCP client (Claude Desktop/Code) launches this server as a local
subprocess and talks to it over stdio; the server then makes HTTPS calls to the **remote**
Workday backend. By default it targets `https://workday.flock.community`, an Ory Oathkeeper
gateway that transparently proxies to the Spring backend and forwards the `Authorization`
header — so the `TOKEN` API key authenticates against the app's `UserKeyTokenFilter`. (The
raw Cloud Run service behind the gateway is an internal upstream; don't target it directly.)

This module is self-contained: it has its own `package.json`/`tsconfig.json` and is **not**
part of the root npm build. Its API types and HTTP client are **generated from the shared
Wirespec contracts** in `../workday-application/src/main/wirespec` (`npm run generate`), so the
MCP stays in sync with the backend instead of hand-maintaining DTOs/endpoints. The generated
output (`src/wirespec/`) is gitignored and bundled into `dist/` by tsup.

## Tools

- `list_expenses` — lists submitted expenses. Defaults to the expenses of the user that owns
  the configured API key (resolved via `GET /api/persons/me`); pass `personId` to view another
  person's expenses (admin only). Optional `limit` (default 25). Needs `ExpenseAuthority.READ`.
- `submit_cost_expense` — creates a cost expense with one or more receipt attachments. Inputs:
  `amount`, `date` (`YYYY-MM-DD`), `description`, `filePaths` (paths on the server's filesystem)
  and/or `attachments` (inline base64 `{ filename, base64 }`) — at least one receipt required —
  plus optional `personId` (defaults to the key owner). Submitted with status `REQUESTED`; needs
  `ExpenseAuthority.WRITE`. Two-step backend flow: each file is uploaded via multipart
  `POST /api/expenses/files` (→ a document UUID), then `POST /api/expenses-cost` references them as
  `files: [{ name, file }]`. All files are uploaded before the expense is created, so a failed
  upload never leaves a half-created expense.

### Hours (work / sick / leave)

Six tools, each a thin pass-through to the generated Wirespec client (`WorkdayClient.listWorkDays` /
`createWorkDay`, and the `…SickDay` / `…LeaveDay` equivalents), plus `list_assignments`
(`GetAssignmentAll`) so the model can discover an `assignmentCode`. All default `personId` to the key
owner (via `getMyPersonId()`) with an optional admin override, and list tools use the `x-total` header
for the count (same pattern as `listExpenses`). List calls pass `sort: undefined` — the controllers
sort server-side (`from DESC, id ASC`).

- `list_work_hours` / `register_work_hours` — `GET`/`POST /api/workdays`. Work hours attach to an
  **assignment**, so `register_work_hours` requires an `assignmentCode` (not a `personId`); `sheets`
  is left unset. Needs `WorkDayAuthority.READ` / `.WRITE`.
- `list_assignments` — `GET /api/assignments`. Helper for finding the `assignmentCode`. Needs
  `AssignmentAuthority.READ`.
- `list_sick_hours` / `register_sick_hours` — `GET`/`POST /api/sickdays`. Attaches to the person
  (optional `description`). Needs `SickdayAuthority.READ` / `.WRITE`.
- `list_leave_hours` / `register_leave_hours` — `GET`/`POST /api/leave-days`. Attaches to the person
  (`description`, optional `type` — defaults `HOLIDAY`). Needs `LeaveDayAuthority.READ` / `.WRITE`.

All registrations submit with status `REQUESTED`. Forms share `from`/`to` (`YYYY-MM-DD`), a total
`hours`, and an optional per-day `days` override. The shared input-schema fragments
(`limitSchema`, `personIdSchema`, `dateSchema`, `hoursSchema`, `daysSchema`) and the
`toolResult` / `summaryWithJson` helpers in `index.ts` keep the handlers uniform.

### Events (Flock days)

Three tools over `/api/events` (which is **not** person-scoped — it returns all events, each with a
`persons` attendee list, so list filtering happens client-side):

- `list_events` — `GetEventAll`. Optional `from`/`to` (client-side overlap filter via `eventOverlaps`,
  ISO dates compared lexicographically) and `type` (`FLOCK_HACK_DAY` / `FLOCK_COMMUNITY_DAY` /
  `CONFERENCE` / `GENERAL_EVENT`); marks `✓you` when the key owner is an attendee. Needs
  `EventAuthority.READ`.
- `subscribe_to_event` / `unsubscribe_from_event` — `SubscribeToEvent` / `UnsubscribeFromEvent`. Act on
  the key owner's person (no personId arg). Needs `EventAuthority.SUBSCRIBE`. Creating events is an
  organizer action (`PostEvent`, `EventAuthority.WRITE`) and is intentionally **not** wrapped — the
  tools only join/leave existing events.

These exist to support the "fill my month" flow: Flock days are events, so they're recorded via
`subscribe_to_event` rather than booked as work hours.

### Server `instructions` (UX guidance)

`index.ts` passes an `instructions` string to the `McpServer` constructor (2nd arg). The SDK returns
it in the MCP `initialize` response and clients surface it to the model as standing guidance for the
whole server — it is **not** a tool. It is the home for cross-tool workflow rules, notably: before
`register_work_hours`, call `list_work_hours` to reuse the most recent `assignmentCode` (falling back
to `list_assignments`) and confirm with the user. It also encodes the **"fill my month"** flow: book
the default hours on working days while skipping weekends and **Dutch public holidays** (no holidays
API exists, so the model computes them — including the Easter-based moving dates — for the year),
treat **Flock days as events** (find them with `list_events`, book them via `subscribe_to_event`, never
as work hours), and confirm the plan before registering. The reliable encoding is a single
`register_work_hours` call spanning the month with a `days` array (default hours on working days, 0 on
skipped days). Per-tool `description`s carry the same hints so they also apply when a client ignores
`instructions`. Keep prescriptive guidance here, not in code.

The multipart upload (`WorkdayClient.uploadExpenseFile`) **bypasses the generated Wirespec client**
and calls `fetch` directly: `Wirespec.RawRequest.body` is `string`-only and the shared `handle()`
forces `Content-Type: application/json`, neither of which fits `multipart/form-data`. The JSON
create call (`createCostExpense`) goes through the generated `CostExpenseCreate` as usual.
Attachments reach the server two ways: a **file path** the server can read (best when the file is
local — the Claude Code CLI, or a saved file), or **inline base64** for when the file is not on the
server's filesystem (e.g. an upload inside Claude Chat's sandbox, where Claude base64-encodes the
file in-sandbox and passes it as a tool argument). Base64 carries exact bytes but is bounded by
tool-argument size, so keep files small (downscale large images). Travel expenses don't support
files, so there is no `submit_travel_expense`.

## Authentication

Calls the backend with the header `Authorization: TOKEN <key>` (see
`workday-user/.../filters/UserKeyTokenFilter.kt`). The key inherits the user's permissions, so
each tool requires whatever authority that operation needs (e.g. `ExpenseAuthority.READ` to list
expenses).

Mint a key from the Workday web app's API-key feature (it calls
`POST /api/user-accounts/generate-key` while you are logged in). The plaintext `key` is
returned **once** — copy it.

## Configuration (env vars)

| Variable           | Required | Default                          | Notes                                            |
| ------------------ | -------- | -------------------------------- | ------------------------------------------------ |
| `WORKDAY_API_KEY`  | yes      | —                                | Plaintext key from above.                        |
| `WORKDAY_BASE_URL` | no       | `https://workday.flock.community`| Backend base URL. Override for a local backend.  |

## Build & run

```bash
npm install        # also runs `npm run generate` via the prepare hook
npm run build      # regenerate the Wirespec client, then bundle to dist/index.js
WORKDAY_API_KEY=<key> npm start          # runs the stdio server
```

`npm run build` runs `wirespec compile` (TypeScript) over the contracts in
`../workday-application/src/main/wirespec` into `src/wirespec/`, then bundles everything with
tsup. After changing a `.ws` contract, just re-run `npm run build` — no hand edits needed.
Type-check separately with `npm run typecheck`.

Exercise the tool without a Claude client using the MCP Inspector:

```bash
WORKDAY_API_KEY=<key> npx @modelcontextprotocol/inspector node dist/index.js
```

## Wire into a Claude client

**Claude Desktop** — add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "workday": {
      "command": "node",
      "args": ["<abs-path>/workday-mcp/dist/index.js"],
      "env": { "WORKDAY_API_KEY": "<key>" }
    }
  }
}
```

**Claude Code**:

```bash
claude mcp add workday --env WORKDAY_API_KEY=<key> -- node <abs-path>/workday-mcp/dist/index.js
```

(claude.ai's hosted "Connectors" are remote HTTP servers and do not apply to this local
stdio server.)
