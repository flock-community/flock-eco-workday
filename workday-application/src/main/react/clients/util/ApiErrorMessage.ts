/**
 * Wirespec endpoints answer a rejected request with a typed `{ message }` body
 * (the shared `Error` type), which the resource clients surface as the message
 * of the thrown `Error`. This digs the human readable message back out of it
 * and falls back to `fallback` for anything that is not such a body.
 */
export function apiErrorMessage(error: unknown, fallback: string): string {
  const raw = error instanceof Error ? error.message : '';
  if (!raw) return fallback;
  try {
    const body = JSON.parse(raw);
    return typeof body?.message === 'string' && body.message.trim() !== ''
      ? body.message
      : fallback;
  } catch {
    return fallback;
  }
}
