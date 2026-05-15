import type { Role, Permission } from "@/types/auth.types";

export function hasRole(userRoles: Role[], required: Role): boolean {
  return userRoles.includes(required);
}

export function hasPermission(userPermissions: Permission[], required: Permission): boolean {
  return userPermissions.includes(required);
}

export function getHomeByRole(roles: Role[]): string {
  if (roles.includes("SUPERADMIN")) return "/superadmin";
  if (roles.includes("ADMIN")) return "/admin";
  if (roles.includes("MANAGER")) return "/manager";
  if (roles.includes("EDITOR")) return "/editor";
  return "/user";
}