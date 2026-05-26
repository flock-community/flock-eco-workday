# workday-mcp

A **local** [MCP](https://modelcontextprotocol.io) server (stdio) that exposes
flock-eco-workday functionality to an MCP client such as Claude. It is a thin wrapper over the
existing Workday REST API — it adds no business logic of its own. Tooling starts with expenses
and grows from there (see Tools below).

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
  person's expenses (admin only). Optional `limit` (default 25).

Planned next: `submit_cost_expense` / `submit_travel_expense` (`POST /api/expenses-cost` and
`/api/expenses-travel`, which require `ExpenseAuthority.WRITE`).

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
