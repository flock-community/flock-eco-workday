import { client } from "./wirespec/client.js";
import type { Wirespec } from "./wirespec/Wirespec.js";
import type { Expense } from "./wirespec/model/index.js";
import { serialization } from "./wirespec-serialization.js";

// Public Ory Oathkeeper gateway that transparently proxies to the Spring backend and
// forwards the Authorization header (so API-key auth works). Override with WORKDAY_BASE_URL
// to target a local backend (e.g. http://localhost:8080).
const DEFAULT_BASE_URL = "https://workday.flock.community";

export class WorkdayApiError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "WorkdayApiError";
    this.status = status;
  }
}

/** Thin client for the flock-eco-workday REST API, authenticated with a local API key. */
export class WorkdayClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly wire: ReturnType<typeof client>;

  constructor() {
    const apiKey = process.env.WORKDAY_API_KEY;
    if (!apiKey) {
      throw new WorkdayApiError(
        "WORKDAY_API_KEY is not set. Mint a key while logged in via POST /api/user-accounts/generate-key and export it as WORKDAY_API_KEY.",
      );
    }
    this.apiKey = apiKey;
    this.baseUrl = (process.env.WORKDAY_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
    // The generated Wirespec client builds RawRequests and parses RawResponses; this handler
    // is the only transport-specific piece (URL assembly, API-key auth, error mapping).
    this.wire = client(serialization, (req) => this.handle(req));
  }

  private async handle(req: Wirespec.RawRequest): Promise<Wirespec.RawResponse> {
    const url = new URL(`${this.baseUrl}/${req.path.join("/")}`);
    for (const [key, value] of Object.entries(req.queries)) {
      if (value != null) url.searchParams.set(key, value);
    }

    let res: Response;
    try {
      res = await fetch(url, {
        method: req.method,
        // Unauthenticated requests are redirected to a login page; surface that as an auth
        // error instead of silently following it to an HTML page (which would break JSON parsing).
        redirect: "manual",
        headers: {
          ...req.headers,
          Authorization: `TOKEN ${this.apiKey}`,
          Accept: "application/json",
          ...(req.body !== undefined ? { "Content-Type": "application/json" } : {}),
        },
        body: req.body,
      });
    } catch (cause) {
      throw new WorkdayApiError(
        `Could not reach the Workday backend at ${this.baseUrl} — is it reachable? (${(cause as Error).message})`,
      );
    }

    if (res.status >= 300 && res.status < 400) {
      throw new WorkdayApiError(
        `Authentication failed: the backend redirected to a login page (HTTP ${res.status}). Check that WORKDAY_API_KEY is valid and has the required authority.`,
        res.status,
      );
    }
    if (!res.ok) {
      throw new WorkdayApiError(describeStatus(res.status, url.pathname), res.status);
    }

    const headers: Record<string, string> = {};
    res.headers.forEach((value, key) => {
      headers[key] = value;
    });
    return { status: res.status, headers, body: await res.text() };
  }

  /** Resolve the personId of the user that owns the configured API key. */
  async getMyPersonId(): Promise<string> {
    let uuid: string | undefined;
    try {
      uuid = (await this.wire.GetPersonMe()).body.uuid;
    } catch (err) {
      if (err instanceof WorkdayApiError && err.status === 404) {
        throw new WorkdayApiError(
          "No Person is linked to this API key's user (GET /api/persons/me returned 404).",
          404,
        );
      }
      throw err;
    }
    if (!uuid) {
      throw new WorkdayApiError("GET /api/persons/me returned no uuid.");
    }
    return uuid;
  }

  /** List a person's expenses. `total` comes from the `x-total` response header. */
  async listExpenses(personId: string, size: number): Promise<{ items: Expense[]; total: number }> {
    // /api/expenses 500s unless `page` is present AND `sort` resolves to a single valid property:
    // omitting `sort` triggers a broken multi-column default, and an encoded comma (date%2Cdesc)
    // is parsed as one invalid property. A single-element `sort` (→ `sort=date`) avoids both.
    const { body: items, headers } = await this.wire.ExpenseAll({
      personId,
      page: 0,
      size,
      sort: ["date"],
    });
    const total = headers["x-total"] ?? items.length;
    return { items, total };
  }
}

function describeStatus(status: number, path: string): string {
  switch (status) {
    case 401:
      return "Unauthorized (401): the API key is missing or invalid.";
    case 403:
      return "Forbidden (403): the API key's user lacks the required authority (expenses need ExpenseAuthority.READ).";
    case 404:
      return `Not found (404) for ${path}.`;
    default:
      return `Workday API request to ${path} failed with HTTP ${status}.`;
  }
}
