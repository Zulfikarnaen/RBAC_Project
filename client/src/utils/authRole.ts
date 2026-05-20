import type { Permission, Role } from "@/types/auth.types";

const ROLE_PRIORITY: Role[] = ["SUPERADMIN", "ADMIN", "MANAGER", "EDITOR", "USER"];
const ROLE_SET = new Set<string>(ROLE_PRIORITY);
const PERMISSION_PRIORITY: Permission[] = [
  "CREATE_USER",
  "READ_USER",
  "UPDATE_USER",
  "DELETE_USER",
  "CREATE_ROLE",
  "READ_ROLE",
  "UPDATE_ROLE",
  "DELETE_ROLE",
  "CREATE_PERMISSION",
  "READ_PERMISSION",
  "UPDATE_PERMISSION",
  "DELETE_PERMISSION",
  "ASSIGN_PERMISSION",
  "ASSIGN_ROLE",
  "PUBLISH_ARTICLE",
  "MANAGER",
];
const PERMISSION_SET = new Set<string>(PERMISSION_PRIORITY);

export function normalizeRole(rawRole: unknown): Role | null {
  const roleName =
    typeof rawRole === "string"
      ? rawRole
      : (rawRole as { name?: unknown; role?: { name?: unknown } } | null)?.role?.name ??
        (rawRole as { name?: unknown } | null)?.name;

  if (typeof roleName !== "string") return null;

  const normalized = roleName.trim().toUpperCase() as Role;
  return ROLE_SET.has(normalized) ? normalized : null;
}

export function normalizeRoles(rawRoles: unknown): Role[] {
  if (!Array.isArray(rawRoles)) return [];

  const uniqueRoles = new Set<Role>();

  rawRoles.forEach((rawRole) => {
    const role = normalizeRole(rawRole);
    if (role) uniqueRoles.add(role);
  });

  return ROLE_PRIORITY.filter((role) => uniqueRoles.has(role));
}

export function getPrimaryRole(rawRoles: unknown): Role | null {
  return normalizeRoles(rawRoles)[0] ?? null;
}

export function normalizePermission(rawPermission: unknown): Permission | null {
  const permissionName =
    typeof rawPermission === "string"
      ? rawPermission
      : (rawPermission as { name?: unknown; permission?: { name?: unknown } } | null)?.permission?.name ??
        (rawPermission as { name?: unknown; slug?: unknown } | null)?.name ??
        (rawPermission as { slug?: unknown } | null)?.slug;

  if (typeof permissionName !== "string") return null;

  const normalized = permissionName.trim().toUpperCase() as Permission;
  return PERMISSION_SET.has(normalized) ? normalized : null;
}

export function normalizePermissions(rawPermissions: unknown): Permission[] {
  if (!Array.isArray(rawPermissions)) return [];

  const uniquePermissions = new Set<Permission>();

  rawPermissions.forEach((rawPermission) => {
    const permission = normalizePermission(rawPermission);
    if (permission) uniquePermissions.add(permission);
  });

  return PERMISSION_PRIORITY.filter((permission) => uniquePermissions.has(permission));
}

export function hasAnyPermission(
  rawPermissions: unknown,
  requiredPermissions: Permission[]
): boolean {
  const permissions = normalizePermissions(rawPermissions);
  return requiredPermissions.some((permission) => permissions.includes(permission));
}
