import type { Permission } from "../entities/Role";

export interface IPermissionRepository {
  findAll(): Promise<Permission[]>;
  findById(id: string): Promise<Permission | null>;
  findByName(name: string): Promise<Permission | null>;
  create(data: { name: string; description?: string }): Promise<Permission>;
  update(id: string, data: { name?: string; description?: string }): Promise<Permission>;
  delete(id: string): Promise<void>;
}
