import { db } from "../../infrastructure/database/prisma-client";

export class AssignRoleToUser {
  async execute(userId: string, roleId: string): Promise<void> {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error(`User "${userId}" tidak ditemukan.`);
    const role = await db.role.findUnique({ where: { id: roleId } });
    if (!role) throw new Error(`Role "${roleId}" tidak ditemukan.`);
    const existing = await db.userRole.findUnique({
      where: { userId_roleId: { userId, roleId } },
    });
    if (existing) throw new Error(`User sudah memiliki role "${role.name}".`);
    await db.userRole.create({ data: { userId, roleId } });
  }

  async revoke(userId: string, roleId: string): Promise<void> {
    const existing = await db.userRole.findUnique({
      where: { userId_roleId: { userId, roleId } },
    });
    if (!existing) throw new Error(`User tidak memiliki role tersebut.`);
    await db.userRole.delete({
      where: { userId_roleId: { userId, roleId } },
    });
  }

  async getRolesOfUser(userId: string) {
    const userRoles = await db.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            permissions: { include: { permission: true } },
          },
        },
      },
    });
    return userRoles.map((ur) => ({
      ...ur.role,
      permissions: ur.role.permissions.map((rp) => rp.permission),
      assignedAt: ur.createdAt,
    }));
  }
}
