import type { UserRole } from "./types";

export const ROUTE_PERMISSIONS: Record<string, UserRole[]> = {
  "/": ["ADMIN", "MANAGER", "EMPLOYEE"],
  "/employees": ["ADMIN", "MANAGER"],
  "/departments": ["ADMIN", "MANAGER"],
  "/positions": ["ADMIN", "MANAGER", "EMPLOYEE"],
  "/vacations": ["ADMIN", "MANAGER", "EMPLOYEE"],
  "/requests": ["ADMIN", "MANAGER", "EMPLOYEE"],
  "/users": ["ADMIN"],
  "/profile": ["ADMIN", "MANAGER", "EMPLOYEE"],
  "/reports": ["ADMIN", "MANAGER", "EMPLOYEE"],
};

export function hasRouteAccess(
  role: UserRole | null,
  pathname: string,
  permissions?: string[],
): boolean {
  if (!role) return false;
  const match = Object.keys(ROUTE_PERMISSIONS)
    .filter((route) =>
      route === "/" ? pathname === "/" : pathname.startsWith(route),
    )
    .sort((a, b) => b.length - a.length)[0];
  if (!match) return true;
  if (ROUTE_PERMISSIONS[match].includes(role)) return true;
  if (match === "/employees" && permissions?.includes("VIEW_ALL_EMPLOYEES"))
    return true;
  return false;
}
