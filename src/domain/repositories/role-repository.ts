import type { Role, RoleWithPermissions } from "../entities/role.entity";

export interface IRoleRepository {
  findAll(): Promise<Role[]>;
  findById(id: string): Promise<RoleWithPermissions | null>;
  findByName(name: string): Promise<Role | null>;
  create(data: { name: string; description?: string }): Promise<Role>;
  update(id: string, data: { name?: string; description?: string }): Promise<Role>;
  delete(id: string): Promise<void>;
  assignPermission(roleId: string, permissionId: string): Promise<void>;
  revokePermission(roleId: string, permissionId: string): Promise<void>;
}
