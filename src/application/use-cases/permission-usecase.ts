import type { IPermissionRepository } from "../../domain/repositories/permission-repository";
import type { Permission } from "../../domain/entities/role.entity";

export class PermissionUsecase {
  constructor(private readonly permissionRepo: IPermissionRepository) {}

  async getAllPermissions(): Promise<Permission[]> {
    return this.permissionRepo.findAll();
  }

  async getPermissionById(id: string): Promise<Permission> {
    const perm = await this.permissionRepo.findById(id);
    if (!perm) throw new Error(`Permission "${id}" tidak ditemukan.`);
    return perm;
  }

  async createPermission(data: { name: string; description?: string }): Promise<Permission> {
    const normalized = data.name.trim().toUpperCase().replace(/\s+/g, "_");
    const existing = await this.permissionRepo.findByName(normalized);
    if (existing) throw new Error(`Permission "${normalized}" sudah ada.`);
    return this.permissionRepo.create({ ...data, name: normalized });
  }

  async updatePermission(id: string, data: { name?: string; description?: string }): Promise<Permission> {
    await this.getPermissionById(id);
    if (data.name) {
      const normalized = data.name.trim().toUpperCase().replace(/\s+/g, "_");
      const duplicate = await this.permissionRepo.findByName(normalized);
      if (duplicate && duplicate.id !== id)
        throw new Error(`Permission "${normalized}" sudah dipakai.`);
      data.name = normalized;
    }
    return this.permissionRepo.update(id, data);
  }

  async deletePermission(id: string): Promise<void> {
    await this.getPermissionById(id);
    await this.permissionRepo.delete(id);
  }
}
