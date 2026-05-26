#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
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
