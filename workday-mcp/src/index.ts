#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import { WorkdayApiError, WorkdayClient } from "./client.js";
import type {
  Assignment,
  Expense,
  LeaveDay,
  LeaveDayForm,
  SickDay,
  SickDayForm,
  WorkDay,
  WorkDayForm,
} from "./wirespec/model/index.js";

const DEFAULT_LIMIT = 25;

function formatExpense(e: Expense): string {
  const type = e.expenseType ?? (e.costDetails ? "COST" : e.travelDetails ? "TRAVEL" : "?");
  const parts: string[] = [e.date ?? "(no date)", type];

  if (e.costDetails) {
    parts.push(`amount ${e.costDetails.amount}`);
  } else if (e.travelDetails) {
    parts.push(`${e.travelDetails.distance ?? "?"}km @ ${e.travelDetails.allowance ?? "?"}/km`);
  }

  parts.push(e.status);
  if (e.description) parts.push(`- ${e.description}`);
  return parts.join("  ");
}

/** Decode base64 file content, stripping an optional `data:...;base64,` URI prefix. */
function decodeBase64(input: string): Buffer {
  const comma = input.startsWith("data:") ? input.indexOf(",") : -1;
  const b64 = comma >= 0 ? input.slice(comma + 1) : input;
  return Buffer.from(b64, "base64");
}

/** Render a "from → to" date range, collapsing a single-day range to one date. */
function formatRange(from?: string, to?: string): string {
  if (from && to) return from === to ? from : `${from} → ${to}`;
  return from ?? to ?? "(no date)";
}

function formatWorkDay(w: WorkDay): string {
  const a = w.assignment;
  const assignment = a
    ? `${a.client?.name ?? "?"}${a.project?.name ? `/${a.project.name}` : ""} [${a.code}]`
    : "(no assignment)";
  return `${formatRange(w.from, w.to)}  ${w.hours ?? "?"}h  ${w.status ?? "?"}  ${assignment}  [${w.code}]`;
}

function formatSickDay(s: SickDay): string {
  const parts = [`${formatRange(s.from, s.to)}  ${s.hours ?? "?"}h  ${s.status ?? "?"}`];
  if (s.description) parts.push(`- ${s.description}`);
  parts.push(`[${s.code}]`);
  return parts.join("  ");
}

function formatLeaveDay(l: LeaveDay): string {
  const parts = [`${formatRange(l.from, l.to)}  ${l.hours ?? "?"}h  ${l.type ?? "?"}  ${l.status ?? "?"}`];
  if (l.description) parts.push(`- ${l.description}`);
  parts.push(`[${l.code}]`);
  return parts.join("  ");
}

function formatAssignment(a: Assignment): string {
  const client = a.client?.name ?? "?";
  const project = a.project?.name ? `/${a.project.name}` : "";
  const role = a.role ? ` (${a.role})` : "";
  return `${client}${project}${role}  ${formatRange(a.from, a.to)}  ${a.hoursPerWeek ?? "?"}h/week  [${a.code}]`;
}

// Shared input-schema fragments, mirrored across the day tools.
const limitSchema = z
  .number()
  .int()
  .positive()
  .max(200)
  .optional()
  .describe(`Maximum number of entries to return (default ${DEFAULT_LIMIT}).`);
const personIdSchema = z
  .string()
  .uuid()
  .optional()
  .describe("Override person UUID. Defaults to the API key owner (resolved via /api/persons/me).");
const dateSchema = (which: "start" | "end") =>
  z.string().describe(`The ${which} date in ISO format YYYY-MM-DD, e.g. 2026-05-20.`);
const hoursSchema = z
  .number()
  .positive()
  .describe("Total hours for the period (spread evenly across working days unless `days` is given).");
const daysSchema = z
  .array(z.number())
  .optional()
  .describe(
    "Optional per-day hours, one entry per calendar day from `from` to `to` (use 0 for non-working days). " +
      "Overrides the even spread of `hours`.",
  );

/** Wrap a handler so thrown WorkdayApiErrors (and anything else) become an MCP error result. */
async function toolResult(
  build: () => Promise<{ content: { type: "text"; text: string }[] }>,
): Promise<{ content: { type: "text"; text: string }[]; isError?: boolean }> {
  try {
    return await build();
  } catch (err) {
    const message =
      err instanceof WorkdayApiError ? err.message : `Unexpected error: ${(err as Error).message}`;
    return { isError: true, content: [{ type: "text", text: message }] };
  }
}

/** Standard two-block result: a human-readable summary plus the raw JSON. */
function summaryWithJson(summary: string, raw: unknown): { content: { type: "text"; text: string }[] } {
  return {
    content: [
      { type: "text", text: summary },
      { type: "text", text: `Raw JSON:\n${JSON.stringify(raw, null, 2)}` },
    ],
  };
}

const server = new McpServer(
  {
    name: "workday-mcp",
    version: "0.1.0",
  },
  {
    instructions: [
      "This server manages a person's expenses and their work, sick, and leave hours in Flock Workday.",
      "All tools default to the person who owns the configured API key; an admin may pass an explicit",
      "`personId`. Dates are ISO `YYYY-MM-DD`. New entries are always submitted with status REQUESTED;",
      "do not promise approval.",
      "",
      "Registering work hours — for a smooth experience, before calling `register_work_hours`:",
      "  1. Call `list_work_hours` to find the person's most recent entry and reuse the SAME",
      "     `assignmentCode` by default (people almost always log against their current assignment).",
      "  2. If there is no prior entry (or the user wants a different one), call `list_assignments`",
      "     and pick an active assignment, asking the user which one if there is more than one.",
      "  3. Propose the assignment, date range, and hours back to the user and confirm before submitting.",
      "Sick and leave hours attach directly to the person, so they need no assignment.",
      "After registering, you may call the matching list tool to show the user the saved entry.",
    ].join("\n"),
  },
);

server.registerTool(
  "list_expenses",
  {
    title: "List expenses",
    description:
      "List submitted expenses from flock-eco-workday. Defaults to the expenses of the user that owns the configured API key; admins can pass a personId to view another person's expenses.",
    inputSchema: {
      limit: z
        .number()
        .int()
        .positive()
        .max(200)
        .optional()
        .describe(`Maximum number of expenses to return (default ${DEFAULT_LIMIT}).`),
      personId: z
        .string()
        .uuid()
        .optional()
        .describe("Override person UUID. Defaults to the API key owner (resolved via /api/persons/me)."),
    },
  },
  async ({ limit, personId }) => {
    try {
      const client = new WorkdayClient();
      const resolvedPersonId = personId ?? (await client.getMyPersonId());
      const { items, total } = await client.listExpenses(resolvedPersonId, limit ?? DEFAULT_LIMIT);

      const header =
        `Found ${total} expense(s) for person ${resolvedPersonId}` +
        (items.length < total ? `, showing ${items.length}:` : ":");
      const lines = items.map((e) => `• ${formatExpense(e)}`);
      const summary = [header, ...lines].join("\n");

      return {
        content: [
          { type: "text", text: summary },
          { type: "text", text: `Raw JSON:\n${JSON.stringify(items, null, 2)}` },
        ],
      };
    } catch (err) {
      const message =
        err instanceof WorkdayApiError ? err.message : `Unexpected error: ${(err as Error).message}`;
      return {
        isError: true,
        content: [{ type: "text", text: message }],
      };
    }
  },
);

server.registerTool(
  "submit_cost_expense",
  {
    title: "Submit cost expense",
    description:
      "Create a cost expense in flock-eco-workday with one or more receipt attachments. Provide the " +
      "amount, the date (YYYY-MM-DD), a short description, and at least one receipt — either as " +
      "`filePaths` (file(s) on the machine running this server) or as `attachments` (inline base64 " +
      "content, for when the file is not on the server's filesystem, e.g. an upload inside Claude " +
      "Chat's sandbox). Prefer `filePaths` when you have a path the server can read — it costs no " +
      "extra tokens; use `attachments` (base64) only when the file is not on the server's machine. " +
      "If you pass a path the server can't read, it returns an error telling you to resend as base64. " +
      "Defaults to the API key owner; admins can pass a personId. Requires ExpenseAuthority.WRITE. " +
      "The expense is submitted with status REQUESTED.",
    inputSchema: {
      amount: z.number().positive().describe("Expense amount, e.g. 44.80."),
      date: z.string().describe("Date of the expense in ISO format YYYY-MM-DD, e.g. 2026-05-20."),
      description: z
        .string()
        .min(1)
        .describe("Short description of the expense, e.g. 'DB train ticket — München HBF'."),
      filePaths: z
        .array(z.string())
        .optional()
        .describe(
          "Path(s) to the receipt file(s) on the machine running this server. Use when the file is " +
            "on the same machine as the server (e.g. Claude Code, or a local file). Provide either " +
            "this and/or `attachments` (at least one receipt is required).",
        ),
      attachments: z
        .array(
          z.object({
            filename: z.string().min(1).describe("File name including extension, e.g. 'receipt.jpg'."),
            base64: z
              .string()
              .min(1)
              .describe("Base64-encoded file content. A 'data:...;base64,' prefix is allowed."),
          }),
        )
        .optional()
        .describe(
          "Inline receipt file(s) as base64. Use when the file is NOT on the server's filesystem " +
            "(e.g. an upload inside Claude Chat's sandbox): base64-encode the file and pass it here. " +
            "Keep files small (e.g. downscale images first) — very large base64 may exceed limits.",
        ),
      personId: z
        .string()
        .uuid()
        .optional()
        .describe("Override person UUID. Defaults to the API key owner (resolved via /api/persons/me)."),
    },
  },
  async ({ amount, date, description, filePaths, attachments, personId }) => {
    try {
      const client = new WorkdayClient();

      const pathList = filePaths ?? [];
      const inlineList = attachments ?? [];
      if (pathList.length + inlineList.length === 0) {
        throw new WorkdayApiError(
          "At least one receipt attachment is required — pass `filePaths` (a file on this server's " +
            "machine) and/or `attachments` (base64 content).",
        );
      }

      const resolvedPersonId = personId ?? (await client.getMyPersonId());

      // Upload every receipt first, so a single unreadable/failed file never leaves a
      // half-created expense referencing a missing attachment.
      const files: { name: string; file: string }[] = [];
      for (const filePath of pathList) {
        let bytes: Buffer;
        try {
          bytes = await readFile(filePath);
        } catch (cause) {
          // A /mnt/user-data/... path is a Claude Chat sandbox upload — it lives on a different
          // machine than this (local) server, so steer the model straight to the base64 route.
          const hint = filePath.includes("/mnt/user-data/")
            ? "This looks like a Claude Chat sandbox path; this server runs on a different machine and " +
              "cannot read it. Re-send the file as base64 in `attachments` (base64-encode it in your " +
              "sandbox; downscale large images first to stay within tool-argument limits)."
            : "Provide a path to a file on the machine running this MCP server, or re-send the file as " +
              "base64 in `attachments`.";
          throw new WorkdayApiError(
            `Could not read attachment "${filePath}": ${(cause as Error).message}. ${hint}`,
          );
        }
        const name = basename(filePath);
        const fileId = await client.uploadExpenseFile(bytes, name);
        files.push({ name, file: fileId });
      }
      for (const att of inlineList) {
        const bytes = decodeBase64(att.base64);
        if (bytes.length === 0) {
          throw new WorkdayApiError(
            `Attachment "${att.filename}" decoded to 0 bytes — the base64 content is empty or invalid.`,
          );
        }
        const fileId = await client.uploadExpenseFile(bytes, att.filename);
        files.push({ name: att.filename, file: fileId });
      }

      const created = await client.createCostExpense({
        personId: resolvedPersonId,
        description,
        date,
        status: "REQUESTED",
        amount,
        files,
      });

      const attached = files.map((f) => f.name).join(", ");
      const summary = `Created cost expense:\n• ${formatExpense(created)}\nAttached: ${attached}`;

      return {
        content: [
          { type: "text", text: summary },
          { type: "text", text: `Raw JSON:\n${JSON.stringify(created, null, 2)}` },
        ],
      };
    } catch (err) {
      const message =
        err instanceof WorkdayApiError ? err.message : `Unexpected error: ${(err as Error).message}`;
      return {
        isError: true,
        content: [{ type: "text", text: message }],
      };
    }
  },
);

// ── Work hours ───────────────────────────────────────────────────────────────

server.registerTool(
  "list_work_hours",
  {
    title: "List work hours",
    description:
      "List registered work-hour entries from flock-eco-workday, most recent first. Defaults to the " +
      "API key owner; admins can pass a personId. Each entry shows its date range, hours, status, and " +
      "the assignment it was logged against (with its assignmentCode in [brackets]). Useful before " +
      "registering new work hours, to reuse the most recent assignmentCode. Needs WorkDayAuthority.READ.",
    inputSchema: { limit: limitSchema, personId: personIdSchema },
  },
  ({ limit, personId }) =>
    toolResult(async () => {
      const client = new WorkdayClient();
      const resolvedPersonId = personId ?? (await client.getMyPersonId());
      const { items, total } = await client.listWorkDays(resolvedPersonId, limit ?? DEFAULT_LIMIT);
      const header =
        `Found ${total} work-hour entr${total === 1 ? "y" : "ies"} for person ${resolvedPersonId}` +
        (items.length < total ? `, showing ${items.length}:` : ":");
      const summary = [header, ...items.map((w) => `• ${formatWorkDay(w)}`)].join("\n");
      return summaryWithJson(summary, items);
    }),
);

server.registerTool(
  "register_work_hours",
  {
    title: "Register work hours",
    description:
      "Register work hours against an assignment in flock-eco-workday. Work hours always belong to an " +
      "assignment, so an `assignmentCode` is required. Before calling this, prefer calling " +
      "`list_work_hours` first and reuse the assignmentCode of the most recent entry (confirm with the " +
      "user); if there is none, use `list_assignments` to find one. Provide `from`/`to` (YYYY-MM-DD; " +
      "use the same date for a single day) and total `hours`, or pass `days` for per-day hours. Defaults " +
      "to the API key owner; admins can pass a personId. Submitted with status REQUESTED. Needs " +
      "WorkDayAuthority.WRITE.",
    inputSchema: {
      assignmentCode: z
        .string()
        .describe("Code of the assignment to log against (from list_work_hours or list_assignments)."),
      from: dateSchema("start"),
      to: dateSchema("end"),
      hours: hoursSchema,
      days: daysSchema,
      personId: personIdSchema,
    },
  },
  ({ assignmentCode, from, to, hours, days, personId }) =>
    toolResult(async () => {
      const client = new WorkdayClient();
      // personId is resolved for parity with the other tools / admin overrides, even though the
      // backend derives ownership from the assignment.
      if (!personId) await client.getMyPersonId();
      const form: WorkDayForm = {
        from,
        to,
        hours,
        days,
        status: "REQUESTED",
        assignmentCode,
        sheets: undefined,
      };
      const created = await client.createWorkDay(form);
      return summaryWithJson(`Registered work hours:\n• ${formatWorkDay(created)}`, created);
    }),
);

server.registerTool(
  "list_assignments",
  {
    title: "List assignments",
    description:
      "List a person's assignments in flock-eco-workday — used to find the `assignmentCode` needed to " +
      "register work hours. Each entry shows the client/project, role, date range, hours per week, and " +
      "the assignmentCode in [brackets]. Defaults to the API key owner; admins can pass a personId. " +
      "Needs AssignmentAuthority.READ.",
    inputSchema: { limit: limitSchema, personId: personIdSchema },
  },
  ({ limit, personId }) =>
    toolResult(async () => {
      const client = new WorkdayClient();
      const resolvedPersonId = personId ?? (await client.getMyPersonId());
      const { items, total } = await client.listAssignments(resolvedPersonId, limit ?? DEFAULT_LIMIT);
      const header =
        `Found ${total} assignment(s) for person ${resolvedPersonId}` +
        (items.length < total ? `, showing ${items.length}:` : ":");
      const summary = [header, ...items.map((a) => `• ${formatAssignment(a)}`)].join("\n");
      return summaryWithJson(summary, items);
    }),
);

// ── Sick hours ─────────────────────────────────────────────────────────────────

server.registerTool(
  "list_sick_hours",
  {
    title: "List sick hours",
    description:
      "List registered sick-hour entries from flock-eco-workday, most recent first. Defaults to the API " +
      "key owner; admins can pass a personId. Needs SickdayAuthority.READ.",
    inputSchema: { limit: limitSchema, personId: personIdSchema },
  },
  ({ limit, personId }) =>
    toolResult(async () => {
      const client = new WorkdayClient();
      const resolvedPersonId = personId ?? (await client.getMyPersonId());
      const { items, total } = await client.listSickDays(resolvedPersonId, limit ?? DEFAULT_LIMIT);
      const header =
        `Found ${total} sick-hour entr${total === 1 ? "y" : "ies"} for person ${resolvedPersonId}` +
        (items.length < total ? `, showing ${items.length}:` : ":");
      const summary = [header, ...items.map((s) => `• ${formatSickDay(s)}`)].join("\n");
      return summaryWithJson(summary, items);
    }),
);

server.registerTool(
  "register_sick_hours",
  {
    title: "Register sick hours",
    description:
      "Register sick hours for a person in flock-eco-workday. Sick hours attach directly to the person, " +
      "so no assignment is needed. Provide `from`/`to` (YYYY-MM-DD; same date for a single day) and total " +
      "`hours`, or pass `days` for per-day hours, plus an optional `description`. Defaults to the API key " +
      "owner; admins can pass a personId. Submitted with status REQUESTED. Needs SickdayAuthority.WRITE.",
    inputSchema: {
      from: dateSchema("start"),
      to: dateSchema("end"),
      hours: hoursSchema,
      days: daysSchema,
      description: z.string().optional().describe("Optional note, e.g. 'flu'."),
      personId: personIdSchema,
    },
  },
  ({ from, to, hours, days, description, personId }) =>
    toolResult(async () => {
      const client = new WorkdayClient();
      const resolvedPersonId = personId ?? (await client.getMyPersonId());
      const form: SickDayForm = {
        from,
        to,
        hours,
        days,
        status: "REQUESTED",
        description,
        personId: resolvedPersonId,
      };
      const created = await client.createSickDay(form);
      return summaryWithJson(`Registered sick hours:\n• ${formatSickDay(created)}`, created);
    }),
);

// ── Leave hours ──────────────────────────────────────────────────────────────

server.registerTool(
  "list_leave_hours",
  {
    title: "List leave hours",
    description:
      "List registered leave-hour entries (holiday and other leave) from flock-eco-workday, most recent " +
      "first. Defaults to the API key owner; admins can pass a personId. Needs LeaveDayAuthority.READ.",
    inputSchema: { limit: limitSchema, personId: personIdSchema },
  },
  ({ limit, personId }) =>
    toolResult(async () => {
      const client = new WorkdayClient();
      const resolvedPersonId = personId ?? (await client.getMyPersonId());
      const { items, total } = await client.listLeaveDays(resolvedPersonId, limit ?? DEFAULT_LIMIT);
      const header =
        `Found ${total} leave-hour entr${total === 1 ? "y" : "ies"} for person ${resolvedPersonId}` +
        (items.length < total ? `, showing ${items.length}:` : ":");
      const summary = [header, ...items.map((l) => `• ${formatLeaveDay(l)}`)].join("\n");
      return summaryWithJson(summary, items);
    }),
);

server.registerTool(
  "register_leave_hours",
  {
    title: "Register leave hours",
    description:
      "Register leave hours (holiday or other leave) for a person in flock-eco-workday. Leave hours attach " +
      "directly to the person, so no assignment is needed. Provide a `description`, `from`/`to` " +
      "(YYYY-MM-DD; same date for a single day) and total `hours`, or pass `days` for per-day hours. " +
      "`type` defaults to HOLIDAY. Defaults to the API key owner; admins can pass a personId. Submitted " +
      "with status REQUESTED. Needs LeaveDayAuthority.WRITE.",
    inputSchema: {
      description: z.string().min(1).describe("Short description of the leave, e.g. 'Summer holiday'."),
      from: dateSchema("start"),
      to: dateSchema("end"),
      hours: hoursSchema,
      days: daysSchema,
      type: z
        .enum(["HOLIDAY", "PLUSDAY", "PAID_PARENTAL_LEAVE", "UNPAID_PARENTAL_LEAVE", "PAID_LEAVE"])
        .optional()
        .describe("Kind of leave. Defaults to HOLIDAY."),
      personId: personIdSchema,
    },
  },
  ({ description, from, to, hours, days, type, personId }) =>
    toolResult(async () => {
      const client = new WorkdayClient();
      const resolvedPersonId = personId ?? (await client.getMyPersonId());
      const form: LeaveDayForm = {
        description,
        from,
        to,
        hours,
        days,
        status: "REQUESTED",
        type: type ?? "HOLIDAY",
        personId: resolvedPersonId,
      };
      const created = await client.createLeaveDay(form);
      return summaryWithJson(`Registered leave hours:\n• ${formatLeaveDay(created)}`, created);
    }),
);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Logs must go to stderr — stdout is the MCP JSON-RPC channel.
  console.error("workday-mcp server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error starting workday-mcp:", err);
  process.exit(1);
});
