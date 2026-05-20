import { db } from "../../infrastructure/database/prisma-client";

export class CheckPermission {
  async execute(userId: string, requiredPermission: string): Promise<boolean> {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: { include: { permission: true } },
              },
            },
          },
        },
      },
    });
    if (!user) return false;
    const allPermissions = user.roles.flatMap((ur) =>
      ur.role.permissions.map((rp) => rp.permission.name)
    );
    return allPermissions.includes(requiredPermission);
  }

  async getPermissionsForUser(userId: string): Promise<string[]> {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: { include: { permission: true } },
              },
            },
          },
        },
      },
    });
    if (!user) return [];
    const allPermissions = user.roles.flatMap((ur) =>
      ur.role.permissions.map((rp) => rp.permission.name)
    );
    return [...new Set(allPermissions)];
  }
}
