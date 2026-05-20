import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/use-auth";
import {
  getPrimaryRole,
  normalizePermissions,
  normalizeRoles,
} from "@/utils/auth-role";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  rbacService,
  type PermissionRecord,
  type RoleRecord,
} from "@/services/rbac-service";
import type { Permission } from "@/types/auth.types";

type Notice = {
  type: "success" | "error";
  message: string;
};

const can = (permissions: Permission[], permission: Permission) => permissions.includes(permission);

const methodClass = {
  GET: "text-sky-600 bg-sky-50",
  POST: "text-emerald-600 bg-emerald-50",
  DEL: "text-rose-600 bg-rose-50",
};

export default function UserPage() {
  const { user } = useAuth();
  const userRoles = normalizeRoles(user?.roles);
  const permissions = normalizePermissions(user?.permissions);
  const primaryRole = getPrimaryRole(userRoles) ?? "USER";

  const [roles, setRoles] = useState<RoleRecord[]>([]);
  const [permissionsList, setPermissionsList] = useState<PermissionRecord[]>([]);
  const [currentUserRoles, setCurrentUserRoles] = useState<RoleRecord[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [selectedRoleDetail, setSelectedRoleDetail] = useState<RoleRecord | null>(null);
  const [selectedPermissionId, setSelectedPermissionId] = useState("");
  const [targetUserId, setTargetUserId] = useState(user?.id ?? "");
  const [targetRoleId, setTargetRoleId] = useState("");
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");
  const [newPermissionName, setNewPermissionName] = useState("");
  const [newPermissionDescription, setNewPermissionDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  const canReadRoles = can(permissions, "READ_ROLE");
  const canCreateRole = can(permissions, "CREATE_ROLE");
  const canDeleteRole = can(permissions, "DELETE_ROLE");
  const canReadPermissions = can(permissions, "READ_PERMISSION");
  const canCreatePermission = can(permissions, "CREATE_PERMISSION");
  const canDeletePermission = can(permissions, "DELETE_PERMISSION");
  const canAssignPermission = can(permissions, "ASSIGN_PERMISSION");
  const canReadUserRole = can(permissions, "READ_USER");
  const canAssignRole = can(permissions, "ASSIGN_ROLE");

  const roleOptions = useMemo(() => roles.map((role) => ({ id: role.id, name: role.name })), [roles]);

  const loadData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setNotice(null);

    try {
      const [rolesRes, permissionsRes, userRolesRes] = await Promise.all([
        canReadRoles || canAssignRole || canAssignPermission ? rbacService.getRoles() : Promise.resolve(null),
        canReadPermissions || canAssignPermission ? rbacService.getPermissions() : Promise.resolve(null),
        canReadUserRole ? rbacService.getUserRoles(user.id) : Promise.resolve(null),
      ]);

      const nextRoles = rolesRes?.data ?? [];
      const nextPermissions = permissionsRes?.data ?? [];
      const nextUserRoles = userRolesRes?.data ?? [];

      setRoles(nextRoles);
      setPermissionsList(nextPermissions);
      setCurrentUserRoles(nextUserRoles);
      setSelectedRoleId((current) => current || nextRoles[0]?.id || "");
      setSelectedPermissionId((current) => current || nextPermissions[0]?.id || "");
      setTargetRoleId((current) => current || nextRoles[0]?.id || "");
      setTargetUserId((current) => current || user.id);
    } catch (error) {
      setNotice({
        type: "error",
        message: error instanceof Error ? error.message : "Gagal memuat data dashboard.",
      });
    } finally {
      setLoading(false);
    }
  }, [canAssignPermission, canAssignRole, canReadPermissions, canReadRoles, canReadUserRole, user]);

  const loadRoleDetail = useCallback(async () => {
    if (!selectedRoleId || !canReadRoles) {
      setSelectedRoleDetail(null);
      return;
    }

    try {
      const res = await rbacService.getRoleDetail(selectedRoleId);
      setSelectedRoleDetail(res.data ?? null);
    } catch {
      setSelectedRoleDetail(null);
    }
  }, [canReadRoles, selectedRoleId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    void loadRoleDetail();
  }, [loadRoleDetail]);

  const runAction = async (action: () => Promise<void>, successMessage: string) => {
    setSubmitting(true);
    setNotice(null);

    try {
      await action();
      setNotice({ type: "success", message: successMessage });
      await loadData();
      await loadRoleDetail();
    } catch (error) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message === "string"
          ? (error as { response: { data: { message: string } } }).response.data.message
          : error instanceof Error
            ? error.message
            : "Aksi gagal dijalankan.";

      setNotice({ type: "error", message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateRole = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void runAction(
      async () => {
        await rbacService.createRole({
          name: newRoleName,
          description: newRoleDescription || undefined,
        });
        setNewRoleName("");
        setNewRoleDescription("");
      },
      "Role berhasil dibuat."
    );
  };

  const handleCreatePermission = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void runAction(
      async () => {
        await rbacService.createPermission({
          name: newPermissionName,
          description: newPermissionDescription || undefined,
        });
        setNewPermissionName("");
        setNewPermissionDescription("");
      },
      "Permission berhasil dibuat."
    );
  };

  const handleAssignPermission = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void runAction(
      async () => {
        await rbacService.assignPermissionToRole(selectedRoleId, selectedPermissionId);
      },
      "Permission berhasil ditautkan ke role."
    );
  };

  const handleAssignRole = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void runAction(
      async () => {
        await rbacService.assignRoleToUser(targetUserId, targetRoleId);
      },
      "Role berhasil ditugaskan ke user."
    );
  };

  const selectedRolePermissions = selectedRoleDetail?.permissions ?? [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <section className="bg-white p-6 rounded-lg border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Dashboard Akses</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-800 tracking-tight">
                {user?.username || user?.email?.split("@")[0] || "User"}
              </h1>
              <p className="text-sm text-slate-500">{user?.email}</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase text-slate-400">Role Utama</p>
              <p className="text-lg font-bold text-indigo-600">{primaryRole}</p>
            </div>
          </div>
        </section>

        {notice && (
          <div
            className={`rounded-lg border px-4 py-3 text-sm font-medium ${
              notice.type === "success"
                ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                : "border-rose-100 bg-rose-50 text-rose-700"
            }`}
          >
            {notice.message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <section className="bg-white p-6 rounded-lg border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">Roles Login</h2>
            <div className="mt-4 flex gap-2 flex-wrap">
              {userRoles.map((role) => (
                <span
                  key={role}
                  className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs rounded-md uppercase font-bold border border-indigo-100"
                >
                  {role}
                </span>
              ))}
            </div>
          </section>

          <section className="bg-white p-6 rounded-lg border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] lg:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">Permissions Login</h2>
              <span className="text-xs font-bold text-slate-400">{permissions.length} permissions</span>
            </div>
            <div className="mt-4 flex gap-2 flex-wrap">
              {permissions.map((permission) => (
                <span
                  key={permission}
                  className="px-2.5 py-1 bg-slate-50 text-slate-600 text-[11px] rounded-md border border-slate-100 font-semibold"
                >
                  {permission}
                </span>
              ))}
            </div>
          </section>
        </div>

        {loading ? (
          <section className="bg-white p-6 rounded-lg border border-slate-100 text-sm text-slate-500">
            Memuat data RBAC dari backend...
          </section>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            {canReadRoles && (
              <section className="bg-white p-6 rounded-lg border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-800">Roles</h2>
                  <span className={`rounded px-2 py-1 text-[10px] font-black ${methodClass.GET}`}>GET</span>
                </div>

                <div className="mt-4 space-y-2">
                  {roles.map((role) => (
                    <div
                      key={role.id}
                      className={`w-full rounded-md border px-3 py-2 text-left ${
                        selectedRoleId === role.id
                          ? "border-indigo-200 bg-indigo-50"
                          : "border-slate-100 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <button type="button" onClick={() => setSelectedRoleId(role.id)} className="min-w-0 text-left">
                          <p className="text-sm font-bold text-slate-700">{role.name}</p>
                          <p className="text-xs text-slate-400">{role.description || "Tanpa deskripsi"}</p>
                        </button>
                        {canDeleteRole && (
                          <button
                            type="button"
                            onClick={() =>
                              void runAction(
                                () => rbacService.deleteRole(role.id).then(() => undefined),
                                "Role berhasil dihapus."
                              )
                            }
                            className="shrink-0 text-xs font-bold text-rose-600"
                            disabled={submitting}
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {canCreateRole && (
                  <form onSubmit={handleCreateRole} className="mt-5 space-y-3 border-t border-slate-100 pt-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-700">Buat Role</p>
                      <span className={`rounded px-2 py-1 text-[10px] font-black ${methodClass.POST}`}>POST</span>
                    </div>
                    <Input
                      label="Nama Role"
                      value={newRoleName}
                      onChange={(event) => setNewRoleName(event.target.value)}
                      placeholder="MANAGER"
                      required
                    />
                    <Input
                      label="Deskripsi"
                      value={newRoleDescription}
                      onChange={(event) => setNewRoleDescription(event.target.value)}
                      placeholder="Role manager"
                    />
                    <Button type="submit" disabled={submitting || !newRoleName.trim()} className="w-full">
                      Simpan Role
                    </Button>
                  </form>
                )}
              </section>
            )}

            {canReadPermissions && (
              <section className="bg-white p-6 rounded-lg border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-800">Permissions</h2>
                  <span className={`rounded px-2 py-1 text-[10px] font-black ${methodClass.GET}`}>GET</span>
                </div>

                <div className="mt-4 max-h-72 space-y-2 overflow-auto pr-1">
                  {permissionsList.map((permission) => (
                    <div
                      key={permission.id}
                      className="flex items-start justify-between gap-3 rounded-md border border-slate-100 px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-bold text-slate-700">{permission.name}</p>
                        <p className="text-xs text-slate-400">{permission.description || "Tanpa deskripsi"}</p>
                      </div>
                      {canDeletePermission && (
                        <button
                          type="button"
                          onClick={() =>
                            void runAction(
                              () => rbacService.deletePermission(permission.id).then(() => undefined),
                              "Permission berhasil dihapus."
                            )
                          }
                          className="text-xs font-bold text-rose-600"
                          disabled={submitting}
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {canCreatePermission && (
                  <form onSubmit={handleCreatePermission} className="mt-5 space-y-3 border-t border-slate-100 pt-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-700">Buat Permission</p>
                      <span className={`rounded px-2 py-1 text-[10px] font-black ${methodClass.POST}`}>POST</span>
                    </div>
                    <Input
                      label="Nama Permission"
                      value={newPermissionName}
                      onChange={(event) => setNewPermissionName(event.target.value)}
                      placeholder="EXPORT_REPORT"
                      required
                    />
                    <Input
                      label="Deskripsi"
                      value={newPermissionDescription}
                      onChange={(event) => setNewPermissionDescription(event.target.value)}
                      placeholder="Mengizinkan export laporan"
                    />
                    <Button type="submit" disabled={submitting || !newPermissionName.trim()} className="w-full">
                      Simpan Permission
                    </Button>
                  </form>
                )}
              </section>
            )}

            {canReadUserRole && (
              <section className="bg-white p-6 rounded-lg border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-800">User-Role</h2>
                  <span className={`rounded px-2 py-1 text-[10px] font-black ${methodClass.GET}`}>GET</span>
                </div>

                <div className="mt-4 space-y-2">
                  {currentUserRoles.map((role) => (
                    <div key={role.id} className="rounded-md border border-slate-100 px-3 py-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-slate-700">{role.name}</p>
                          <p className="text-xs text-slate-400">
                            {(role.permissions ?? []).length} permissions terhubung
                          </p>
                        </div>
                        {canAssignRole && (
                          <button
                            type="button"
                            onClick={() =>
                              void runAction(
                                () => rbacService.revokeRoleFromUser(user?.id ?? "", role.id).then(() => undefined),
                                "Role berhasil dicabut dari user aktif."
                              )
                            }
                            className="text-xs font-bold text-rose-600"
                            disabled={submitting || !user?.id}
                          >
                            Cabut
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {canAssignRole && (
                  <form onSubmit={handleAssignRole} className="mt-5 space-y-3 border-t border-slate-100 pt-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-700">Assign Role ke User</p>
                      <span className={`rounded px-2 py-1 text-[10px] font-black ${methodClass.POST}`}>POST</span>
                    </div>
                    <Input
                      label="User ID Target"
                      value={targetUserId}
                      onChange={(event) => setTargetUserId(event.target.value)}
                      required
                    />
                    <label className="block text-sm font-medium text-gray-700">
                      Role
                      <select
                        value={targetRoleId}
                        onChange={(event) => setTargetRoleId(event.target.value)}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        {roleOptions.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <Button type="submit" disabled={submitting || !targetUserId || !targetRoleId} className="w-full">
                      Assign Role
                    </Button>
                  </form>
                )}
              </section>
            )}
          </div>
        )}

        {canAssignPermission && (
          <section className="bg-white p-6 rounded-lg border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Permission Role Terpilih</h2>
                <p className="text-sm text-slate-500">Pilih role, lalu tautkan atau cabut permission.</p>
              </div>
              <span className={`rounded px-2 py-1 text-[10px] font-black ${methodClass.POST}`}>POST</span>
            </div>

            <form onSubmit={handleAssignPermission} className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
              <label className="block text-sm font-medium text-gray-700">
                Role
                <select
                  value={selectedRoleId}
                  onChange={(event) => setSelectedRoleId(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Permission
                <select
                  value={selectedPermissionId}
                  onChange={(event) => setSelectedPermissionId(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {permissionsList.map((permission) => (
                    <option key={permission.id} value={permission.id}>
                      {permission.name}
                    </option>
                  ))}
                </select>
              </label>
              <Button type="submit" disabled={submitting || !selectedRoleId || !selectedPermissionId}>
                Tautkan
              </Button>
            </form>

            <div className="mt-5 flex flex-wrap gap-2">
              {selectedRolePermissions.map((permission) => (
                <span
                  key={permission.id}
                  className="inline-flex items-center gap-2 rounded-md border border-slate-100 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600"
                >
                  {permission.name}
                  <button
                    type="button"
                    onClick={() =>
                      void runAction(
                        () =>
                          rbacService
                            .revokePermissionFromRole(selectedRoleId, permission.id)
                            .then(() => undefined),
                        "Permission berhasil dicabut dari role."
                      )
                    }
                    className="font-black text-rose-600"
                    disabled={submitting}
                  >
                    x
                  </button>
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}
