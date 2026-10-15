/**
 * Where to go once logged in: a link opened while logged out, such as one to a CV,
 * leads to the login page first. The server remembers it when it serves the app
 * itself; this covers the app served apart from it, as in development.
 */
const KEY = 'workday-return-to';

export function rememberReturnTo(path: string) {
  try {
    sessionStorage.setItem(KEY, path);
  } catch {
    // Then you land on the home page after logging in
  }
}

/** The page to go to after logging in, once; only a path in this app. */
export function takeReturnTo(): string | null {
  try {
    const path = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
    return path?.startsWith('/') && !path.startsWith('//') ? path : null;
  } catch {
    return null;
  }
}
