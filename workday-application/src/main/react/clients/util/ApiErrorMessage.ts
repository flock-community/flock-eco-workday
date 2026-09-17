/**
 * Wirespec endpoints answer a rejected request with a typed `{ message }` body
 * (the shared `Error` type), which the resource clients surface as the message
 * of the thrown `Error`. This digs the human readable message back out of it.
 *
 * Requests that never reach the endpoint (for example a 403 for a missing
 * authority) carry Spring's default `{ status, error }` body instead; those
 * get the status appended so the reason is at least visible. Anything else
 * falls back to `fallback`.
 */
export function apiErrorMessage(error: unknown, fallback: string): string {
  const raw = error instanceof Error ? error.message : '';
  if (!raw) return fallback;
  try {
    const body = JSON.parse(raw);
    if (typeof body?.message === 'string' && body.message.trim() !== '') {
      return body.message;
    }
    if (typeof body?.status === 'number') {
      const reason =
        body.status === 403
          ? 'you are missing the required authority'
          : typeof body?.error === 'string'
            ? body.error
            : 'request failed';
      return `${fallback} (${body.status}: ${reason})`;
    }
    return fallback;
  } catch {
    return fallback;
  }
}
