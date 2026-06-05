export const authSessionCookieName = "authSession";

export function hasAuthSessionMarker(): boolean {
  if (typeof document === "undefined") {
    return false;
  }

  return document.cookie
    .split(";")
    .some((cookie) => cookie.trim().startsWith(`${authSessionCookieName}=`));
}

export function clearAuthSessionMarker(): void {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${authSessionCookieName}=; Max-Age=0; Path=/; SameSite=Lax`;
}
