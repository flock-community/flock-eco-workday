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
      "amount, the date (YYYY-MM-DD), a short description, and the file path(s) of the receipt(s) on " +
      "the filesystem of the machine running this server — each file is uploaded and attached. " +
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
        .min(1)
        .describe(
          "Path(s) to the receipt file(s) on the machine running this server. At least one is " +
            "required. (Images attached in Claude Code are not saved to disk and have no readable path.)",
        ),
      personId: z
        .string()
        .uuid()
        .optional()
        .describe("Override person UUID. Defaults to the API key owner (resolved via /api/persons/me)."),
    },
  },
  async ({ amount, date, description, filePaths, personId }) => {
    try {
      const client = new WorkdayClient();
      const resolvedPersonId = personId ?? (await client.getMyPersonId());

      // Upload every receipt first, so a single unreadable/failed file never leaves a
      // half-created expense referencing a missing attachment.
      const files: { name: string; file: string }[] = [];
      for (const filePath of filePaths) {
        let bytes: Buffer;
        try {
          bytes = await readFile(filePath);
        } catch (cause) {
          throw new WorkdayApiError(
            `Could not read attachment "${filePath}": ${(cause as Error).message}. Provide a path to a ` +
              `file on the machine running this MCP server. (Images attached in Claude Code are not saved ` +
              `to disk, so they have no readable path.)`,
          );
        }
        const name = basename(filePath);
        const fileId = await client.uploadExpenseFile(bytes, name);
        files.push({ name, file: fileId });
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
