export const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/pay", // Public payment link pages
] as const;

export const AUTH_ROUTES = ["/login", "/register"] as const;

export const MERCHANT_ROUTES = ["/dashboard"] as const;

export const ADMIN_ROUTES = ["/admin"] as const;

export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export function isAdminRoute(pathname: string): boolean {
  return ADMIN_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}
