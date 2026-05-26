#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import { WorkdayApiError, WorkdayClient } from "./client.js";
import type { Expense } from "./wirespec/model/index.js";

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

const server = new McpServer({
  name: "workday-mcp",
  version: "0.1.0",
});

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
