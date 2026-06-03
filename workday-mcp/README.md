# Flock Workday MCP

A local [MCP](https://modelcontextprotocol.io) server that connects **Claude to your Flock
Workday instance**. It runs on your machine as a subprocess of your Claude client (Claude Desktop
or Claude Code) and talks to the Flock Workday backend over HTTPS using your personal API key.

It exposes Flock Workday actions to Claude as MCP tools, so you can work with your Workday data in
plain language. The set of tools grows over time — see the list below for what's currently
available.

## Available tools

| Tool | Description |
| --- | --- |
| `list_expenses` | Lists your submitted expenses. Optional `limit` (default 25). Admins can pass a `personId` to view someone else's. |
| `submit_cost_expense` | Creates a cost expense with one or more receipt attachments. You provide the amount, date, a short description, and the receipt(s) — as file path(s) on this machine, or as inline base64. Submitted with status `REQUESTED`; needs write permission. Admins can pass a `personId`. |
| `list_work_hours` | Lists your registered work hours (most recent first), including the assignment each was logged against. Optional `limit`; admins can pass a `personId`. |
| `register_work_hours` | Registers work hours against an assignment (`assignmentCode` required). Provide a date range and hours, and optionally screenshot(s) of your client's hours-registration system. Claude will normally reuse the assignment from your most recent entry — see `list_work_hours` / `list_assignments`. Submitted as `REQUESTED`; needs write permission. |
| `list_assignments` | Lists your assignments, so you (and Claude) can find the `assignmentCode` to log work hours against. Optional `limit`; admins can pass a `personId`. |
| `list_sick_hours` | Lists your registered sick hours (most recent first). Optional `limit`; admins can pass a `personId`. |
| `register_sick_hours` | Registers sick hours for a person (no assignment needed). Provide a date range, hours, and an optional description. Submitted as `REQUESTED`; needs write permission. |
| `list_leave_hours` | Lists your registered leave hours — holiday and other leave (most recent first). Optional `limit`; admins can pass a `personId`. |
| `register_leave_hours` | Registers leave hours for a person (no assignment needed). Provide a description, date range, and hours; `type` defaults to `HOLIDAY`. Submitted as `REQUESTED`; needs write permission. |
| `list_events` | Lists events — Flock days (hack/community days), conferences, and general events — with their dates, type, attendee count, and whether you're subscribed. Optional `from`/`to`/`type` filters. |
| `subscribe_to_event` | Subscribes you to an event by `code` (e.g. join a Flock day, so it's recorded under events instead of as work hours). |
| `unsubscribe_from_event` | Unsubscribes you from an event by `code`. |

Once it's connected, just ask Claude in plain language — for example, _"list my last 5 Workday
expenses"_, _"submit this receipt as an expense"_, _"log 8 hours of work for yesterday"_, or
_"register a sick day for today"_. When you log work hours, Claude will check your latest entry and
suggest reusing the same assignment.

You can also fill a whole month at once — e.g. _"Kun je de uren van deze maand invullen? Standaard
8u per dag behalve op de flock dagen"_. Claude will book the default hours on working days while
**skipping weekends and Dutch public holidays**, look up the month's **Flock days via `list_events`**
(those are booked as events, not work hours), and ask before subscribing you to them. It always
summarises the plan and asks for confirmation before registering anything.

> **Note on attachments:** Both `submit_cost_expense` (receipts) and `register_work_hours`
> (screenshots of your client's hours-registration system) accept attachments the same way, in one
> of two forms. **(1) `filePaths`** — path(s) to file(s) on the **machine running this server**
> (your own machine, e.g. your Mac). This covers Claude Desktop attachments, Claude Code
> references, and any local file. The server reads them itself — Claude should pass the path
> as-is, _without_ first trying to open it from its own sandbox (which can't see your filesystem).
> **(2) `attachments`** — inline **base64**, for files that live in Claude's own sandbox (paths
> like `/mnt/user-data/uploads/...`) and so aren't reachable from your machine. Keep base64 small —
> downscale large images first, as very large base64 may exceed tool-argument limits.
> `submit_cost_expense` requires at least one attachment; on `register_work_hours` they're optional
> but typically expected.

## Prerequisites

- **Node.js 18 or newer** and **npm** (`node --version` to check).
- **A local clone of the full `flock-eco-workday` repository.** The server builds its API client
  from the shared Wirespec contracts in the sibling `workday-application` module, so building from
  the `workday-mcp` folder on its own will not work — you need the whole repo checked out.
- **A Flock Workday account** with the permissions required for the actions you want Claude to
  perform, plus a personal **API key** (see step 2). The key inherits your account's permissions.
- **An MCP-capable Claude client:** [Claude Desktop](https://claude.ai/download) (macOS/Windows) or
  [Claude Code](https://claude.com/claude-code) (the CLI, all platforms).

---

## Install with Claude (quickest)

If you have **Claude Code**, let it do the setup for you. Open Claude Code in this `workday-mcp`
directory and run the bundled skill:

```
/install-workday-mcp
```

(or just ask Claude, e.g. _"install the Workday MCP"_). The skill builds the server and registers it
with the client you choose — Claude Code or Claude Desktop. You'll still **mint a Workday API key
yourself** and paste it when prompted (see **Step 2** below for how to get one).

Prefer to set it up by hand? Follow the manual steps below.

---

## Step 1 — Build the server

From your clone of the repository:

```bash
cd flock-eco-workday/workday-mcp
npm install      # installs dependencies and generates the API client
npm run build    # regenerates the client and bundles it to dist/index.js
```

This produces **`dist/index.js`** — the runnable server.

Note the **absolute path** to that file; you'll need it when configuring Claude. From the
`workday-mcp` directory:

```bash
echo "$(pwd)/dist/index.js"
# e.g. /home/you/flock-eco-workday/workday-mcp/dist/index.js
```

---

## Step 2 — Get a Workday API key

1. Log in to the Workday web app in your browser.
2. Open the **API-key** feature and generate a new key (this calls
   `POST /api/user-accounts/generate-key` on your behalf).
3. **Copy the key immediately** — the full plaintext value is shown **only once**. If you lose it,
   just generate a new one.

The key inherits your account's permissions — each tool works only if your account is allowed to
perform that action.

---

## Step 3 — Connect it to Claude

Pick the client you use. In both cases you supply two things: the **path to `dist/index.js`** from
step 1 and your **API key** from step 2.

### Claude Desktop (macOS / Windows)

1. Open **Settings → Developer → Edit Config** (this opens `claude_desktop_config.json`).
   You can also edit it directly:
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
2. Add a `workday` entry under `mcpServers` (merge with anything already there):

   ```json
   {
     "mcpServers": {
       "workday": {
         "command": "node",
         "args": ["/absolute/path/to/flock-eco-workday/workday-mcp/dist/index.js"],
         "env": {
           "WORKDAY_API_KEY": "your-api-key-here"
         }
       }
     }
   }
   ```

3. **Fully quit and reopen Claude Desktop.** New MCP servers are only picked up on restart.

### Claude Code (CLI)

Run this from anywhere, substituting your path and key:

```bash
claude mcp add --scope user \
  --env WORKDAY_API_KEY=your-api-key-here \
  workday -- node /absolute/path/to/flock-eco-workday/workday-mcp/dist/index.js
```

`--scope user` makes it available in all your projects (drop it, or use `--scope local`, to register
it for just the current directory). Check it registered with `claude mcp list`.

---

## Step 4 — Try it

Start a new conversation in Claude and ask:

> List my Workday expenses.

Claude should call `list_expenses` and show your expenses. In Claude Desktop you can confirm the
server is connected via the tools/plug icon in the message bar.

---

## Configuration reference

Set these as environment variables (in the `env` block of your Claude config):

| Variable | Required | Default | Notes |
| --- | --- | --- | --- |
| `WORKDAY_API_KEY` | **yes** | — | Your personal API key from step 2. |
| `WORKDAY_BASE_URL` | no | `https://workday.flock.community` | Backend URL. Override only to target a different/local backend (e.g. `http://localhost:8080`). |

---

## Troubleshooting

| Message / symptom | What it means & how to fix |
| --- | --- |
| `WORKDAY_API_KEY is not set` | The key isn't reaching the server. Check the `env` block in your Claude config and restart the client. |
| `Unauthorized (401)` | The key is missing or invalid. Generate a fresh key (step 2). |
| `Forbidden (403)` | Your account lacks the permission required for that action. Ask a Flock Workday admin to grant it. |
| `Authentication failed: the backend redirected to a login page` | The key is invalid or expired — mint a new one. |
| `Could not reach the Workday backend` | Network issue, or you're off a required VPN. Verify you can reach `WORKDAY_BASE_URL` in a browser. |
| Claude doesn't show the tool | Confirm the path in `args` is absolute and points at an existing `dist/index.js`, that the JSON is valid, and that you **restarted** Claude Desktop. |

To test the server outside of Claude, use the MCP Inspector:

```bash
WORKDAY_API_KEY=your-api-key-here npx @modelcontextprotocol/inspector node dist/index.js
```

---

## Keeping it up to date

If the backend's API contracts change, pull the latest repo and rebuild:

```bash
git pull
cd workday-mcp
npm run build
```

The client is regenerated from the contracts on every build, so there's nothing to hand-edit.

> **Developers:** see [`CLAUDE.md`](./CLAUDE.md) for architecture, the Wirespec build pipeline, and
> internals.
