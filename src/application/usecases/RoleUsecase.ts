import type { IRoleRepository } from "../../domain/repositories/IRoleRepository";
import type { IPermissionRepository } from "../../domain/repositories/IPermissionRepository";
import type { Role, RoleWithPermissions } from "../../domain/entities/Role";

export class RoleUsecase {
  constructor(
    private readonly roleRepo: IRoleRepository,
    private readonly permissionRepo: IPermissionRepository
  ) {}

  async getAllRoles(): Promise<Role[]> {
    return this.roleRepo.findAll();
  }

  async getRoleById(id: string): Promise<RoleWithPermissions> {
    const role = await this.roleRepo.findById(id);
    if (!role) throw new Error(`Role dengan id "${id}" tidak ditemukan.`);
    return role;
  }

  async createRole(data: { name: string; description?: string }): Promise<Role> {
    const existing = await this.roleRepo.findByName(data.name);
    if (existing) throw new Error(`Role "${data.name}" sudah ada.`);
    return this.roleRepo.create(data);
  }

  async updateRole(id: string, data: { name?: string; description?: string }): Promise<Role> {
    await this.getRoleById(id);
    if (data.name) {
      const duplicate = await this.roleRepo.findByName(data.name);
      if (duplicate && duplicate.id !== id)
        throw new Error(`Role dengan nama "${data.name}" sudah dipakai.`);
    }
    return this.roleRepo.update(id, data);
  }

  async deleteRole(id: string): Promise<void> {
    await this.getRoleById(id);
    await this.roleRepo.delete(id);
  }

  async assignPermission(roleId: string, permissionId: string): Promise<void> {
    const role = await this.roleRepo.findById(roleId);
    if (!role) throw new Error(`Role "${roleId}" tidak ditemukan.`);
    const permission = await this.permissionRepo.findById(permissionId);
    if (!permission) throw new Error(`Permission "${permissionId}" tidak ditemukan.`);
    const alreadyAssigned = role.permissions.some((p) => p.id === permissionId);
    if (alreadyAssigned) throw new Error(`Permission sudah di-assign ke role ini.`);
    await this.roleRepo.assignPermission(roleId, permissionId);
  }

  async revokePermission(roleId: string, permissionId: string): Promise<void> {
    const role = await this.roleRepo.findById(roleId);
    if (!role) throw new Error(`Role "${roleId}" tidak ditemukan.`);
    const isAssigned = role.permissions.some((p) => p.id === permissionId);
    if (!isAssigned) throw new Error(`Permission tidak ditemukan di role ini.`);
    await this.roleRepo.revokePermission(roleId, permissionId);
  }
}
