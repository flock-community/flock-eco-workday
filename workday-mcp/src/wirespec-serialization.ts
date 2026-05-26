import type { Wirespec } from "./wirespec/Wirespec.js";

function serializeValue(value: unknown): string {
  if (value === undefined || value === null) return value as unknown as string;
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map(serializeValue).join(",");
  return JSON.stringify(value);
}

/**
 * Serialization for the generated Wirespec client. Path/query params must serialize to
 * bare strings (not JSON-quoted), so primitives pass through and only objects are
 * JSON-encoded. Arrays join on "," — keeping `sort: ["date"]` a single comma-free token,
 * which `/api/expenses` requires (a multi-column or comma-encoded sort 500s).
 */
export const serialization: Wirespec.Serialization = {
  serialize: (value: unknown): string => serializeValue(value),
  deserialize: <T>(raw: string | undefined): T => {
    if (raw === undefined) return undefined as T;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as unknown as T;
    }
  },
};
