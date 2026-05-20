import api from "./api";
import type { ApiResponse } from "@/types/api.types";

export type PermissionRecord = {
  id: string;
  name: string;
  description?: string | null;
};

export type RoleRecord = {
  id: string;
  name: string;
  description?: string | null;
  permissions?: PermissionRecord[];
  assignedAt?: string;
};

export const rbacService = {
  getRoles: async () => {
    const res = await api.get<ApiResponse<RoleRecord[]>>("/roles");
    return res.data;
  },

  getRoleDetail: async (roleId: string) => {
    const res = await api.get<ApiResponse<RoleRecord>>(`/roles/${roleId}`);
    return res.data;
  },

  createRole: async (payload: { name: string; description?: string }) => {
    const res = await api.post<ApiResponse<RoleRecord>>("/roles", payload);
    return res.data;
  },

  deleteRole: async (roleId: string) => {
    const res = await api.delete<ApiResponse<{ message: string }>>(`/roles/${roleId}`);
    return res.data;
  },

  assignPermissionToRole: async (roleId: string, permissionId: string) => {
    const res = await api.post<ApiResponse<{ message: string }>>(`/roles/${roleId}/permissions`, {
      permissionId,
    });
    return res.data;
  },

  revokePermissionFromRole: async (roleId: string, permissionId: string) => {
    const res = await api.delete<ApiResponse<{ message: string }>>(
      `/roles/${roleId}/permissions/${permissionId}`
    );
    return res.data;
  },

  getPermissions: async () => {
    const res = await api.get<ApiResponse<PermissionRecord[]>>("/permissions");
    return res.data;
  },

  createPermission: async (payload: { name: string; description?: string }) => {
    const res = await api.post<ApiResponse<PermissionRecord>>("/permissions", payload);
    return res.data;
  },

  deletePermission: async (permissionId: string) => {
    const res = await api.delete<ApiResponse<{ message: string }>>(`/permissions/${permissionId}`);
    return res.data;
  },

  getUserRoles: async (userId: string) => {
    const res = await api.get<ApiResponse<RoleRecord[]>>(`/users/${userId}/roles`);
    return res.data;
  },

  assignRoleToUser: async (userId: string, roleId: string) => {
    const res = await api.post<ApiResponse<{ message: string }>>(`/users/${userId}/roles`, {
      roleId,
    });
    return res.data;
  },

  revokeRoleFromUser: async (userId: string, roleId: string) => {
    const res = await api.delete<ApiResponse<{ message: string }>>(`/users/${userId}/roles/${roleId}`);
    return res.data;
  },
};
