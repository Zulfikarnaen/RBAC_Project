import { db } from "../prisma-client";
import type { IPermissionRepository } from "../../../domain/repositories/IPermissionRepository";
import type { Permission } from "../../../domain/entities/Role";

export class PrismaPermissionRepository implements IPermissionRepository {

  async findAll(): Promise<Permission[]> {
    return db.permission.findMany({ orderBy: { name: "asc" } });
  }

  async findById(id: string): Promise<Permission | null> {
    return db.permission.findUnique({ where: { id } });
  }

  async findByName(name: string): Promise<Permission | null> {
    return db.permission.findUnique({ where: { name } });
  }

  async create(data: { name: string; description?: string }): Promise<Permission> {
    return db.permission.create({ data });
  }

  async update(id: string, data: { name?: string; description?: string }): Promise<Permission> {
    return db.permission.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await db.permission.delete({ where: { id } });
  }
}
