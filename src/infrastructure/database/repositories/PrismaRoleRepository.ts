import { db } from "../prisma-client";
import type { IRoleRepository } from "../../../domain/repositories/IRoleRepository";
import type { Role, RoleWithPermissions } from "../../../domain/entities/Role";

export class PrismaRoleRepository implements IRoleRepository {

  async findAll(): Promise<Role[]> {
    return db.role.findMany({ orderBy: { createdAt: "asc" } });
  }

  async findById(id: string): Promise<RoleWithPermissions | null> {
    const role = await db.role.findUnique({
      where: { id },
      include: {
        permissions: { include: { permission: true } },
      },
    });
    if (!role) return null;
    return {
      ...role,
      permissions: role.permissions.map((rp) => rp.permission),
    };
  }

  async findByName(name: string): Promise<Role | null> {
    return db.role.findUnique({ where: { name } });
  }

  async create(data: { name: string; description?: string }): Promise<Role> {
    return db.role.create({ data });
  }

  async update(id: string, data: { name?: string; description?: string }): Promise<Role> {
    return db.role.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await db.role.delete({ where: { id } });
  }

  async assignPermission(roleId: string, permissionId: string): Promise<void> {
    await db.rolePermission.create({ data: { roleId, permissionId } });
  }

  async revokePermission(roleId: string, permissionId: string): Promise<void> {
    await db.rolePermission.delete({
      where: { roleId_permissionId: { roleId, permissionId } },
    });
  }
}
