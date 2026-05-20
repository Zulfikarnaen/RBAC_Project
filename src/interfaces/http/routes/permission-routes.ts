import { Elysia, t } from "elysia";
import { PermissionUsecase } from "../../../application/use-cases/permission-usecase";
import { AssignRoleToUser } from "../../../application/use-cases/assign-role-to-user";
import { rbacGuard } from "../middleware/rbac-middleware";
import { createdDataResponse, dataResponse, errorResponse, messageResponse } from "../responses/http-response";

export function createPermissionRoutes(permissionUsecase: PermissionUsecase) {
  return new Elysia({ prefix: "/permissions" })

  // GET /permissions
  .get("/", async ({ set }) => {
    try {
      const perms = await permissionUsecase.getAllPermissions();
      return dataResponse(perms);
    } catch (err: unknown) {
      return errorResponse(set, 500, err);
    }
  }, {
    detail: {
      tags: ["Permissions"],
      summary: "Daftar Semua Permission",
      description: "Mengambil daftar lengkap hak akses (permissions) baku yang terdaftar di dalam sistem.",
    },
  })

  // GET /permissions/:id
  .get("/:id", async ({ params, set }) => {
    try {
      const perm = await permissionUsecase.getPermissionById(params.id);
      return dataResponse(perm);
    } catch (err: unknown) {
      return errorResponse(set, 404, err);
    }
  }, {
    params: t.Object({
      id: t.String({ description: "UUID dari permission" }),
    }),
    detail: {
      tags: ["Permissions"],
      summary: "Detail Permission Berdasarkan ID",
      description: "Mencari dan menampilkan rincian data tunggal dari sebuah permission.",
    },
  })

  // POST /permissions
  .post("/", async ({ body, set }) => {
    try {
      const perm = await permissionUsecase.createPermission(body);
      return createdDataResponse(set, perm);
    } catch (err: unknown) {
      return errorResponse(set, 400, err);
    }
  }, {
    beforeHandle: rbacGuard("CREATE_PERMISSION"),
    body: t.Object({
      name: t.String({ minLength: 2, default: "EXPORT_REPORT" }),
      description: t.Optional(t.String({ default: "Mengizinkan pengguna mengekspor laporan sistem" })),
    }),
    detail: {
      tags: ["Permissions"],
      summary: "Membuat Permission Baru",
      description: "Menambahkan entitas permission baru. Sistem otomatis memformat input nama menjadi huruf kapital dengan garis bawah (UPPER_SNAKE_CASE).",
    },
  })

  // PUT /permissions/:id
  .put("/:id", async ({ params, body, set }) => {
    try {
      const perm = await permissionUsecase.updatePermission(params.id, body);
      return dataResponse(perm);
    } catch (err: unknown) {
      return errorResponse(set, 400, err);
    }
  }, {
    beforeHandle: rbacGuard("UPDATE_PERMISSION"),
    params: t.Object({
      id: t.String({ description: "UUID dari permission yang diubah" }),
    }),
    body: t.Object({
      name: t.Optional(t.String({ minLength: 2, default: "EXPORT_REPORT_V2" })),
      description: t.Optional(t.String({ default: "Deskripsi permission yang diperbarui" })),
    }),
    detail: {
      tags: ["Permissions"],
      summary: "Memperbarui Data Permission",
      description: "Mengubah informasi nama atau deskripsi dari sebuah permission. Membutuhkan izin akses UPDATE_PERMISSION.",
    },
  })

  // DELETE /permissions/:id
  .delete("/:id", async ({ params, set }) => {
    try {
      await permissionUsecase.deletePermission(params.id);
      return messageResponse("Permission berhasil dihapus.");
    } catch (err: unknown) {
      return errorResponse(set, 404, err);
    }
  }, {
    beforeHandle: rbacGuard("DELETE_PERMISSION"),
    params: t.Object({
      id: t.String({ description: "UUID dari permission yang dihapus" }),
    }),
    detail: {
      tags: ["Permissions"],
      summary: "Menghapus Permission",
      description: "Menghapus hak akses dari sistem secara permanen beserta seluruh relasi pivotnya.",
    },
  });
}

export function createUserRoleRoutes(assignRoleUsecase: AssignRoleToUser) {
  return new Elysia({ prefix: "/users" })

  // GET /users/:userId/roles
  .get("/:userId/roles", async ({ params, set }) => {
    try {
      const roles = await assignRoleUsecase.getRolesOfUser(params.userId);
      return dataResponse(roles);
    } catch (err: unknown) {
      return errorResponse(set, 500, err);
    }
  }, {
    params: t.Object({
      userId: t.String({ description: "UUID dari pengguna (user)" }),
    }),
    detail: {
      tags: ["User-Role"],
      summary: "Melihat Daftar Role Pengguna",
      description: "Mengambil daftar seluruh role yang ditugaskan kepada seorang pengguna tertentu beserta kumpulan hak akses di dalamnya.",
    },
  })

  // POST /users/:userId/roles
  .post("/:userId/roles", async ({ params, body, set }) => {
    try {
      await assignRoleUsecase.execute(params.userId, body.roleId);
      return messageResponse("Role berhasil di-assign ke user.");
    } catch (err: unknown) {
      return errorResponse(set, 400, err);
    }
  }, {
    beforeHandle: rbacGuard("ASSIGN_ROLE"),
    params: t.Object({
      userId: t.String({ description: "UUID dari pengguna target" }),
    }),
    body: t.Object({
      roleId: t.String({ description: "UUID dari role yang akan ditugaskan" }),
    }),
    detail: {
      tags: ["User-Role"],
      summary: "Menugaskan Role ke Pengguna",
      description: "Menambahkan penugasan (assignment) sebuah role kepada pengguna melalui tabel pivot UserRole. Membutuhkan izin ASSIGN_ROLE.",
    },
  })

  // DELETE /users/:userId/roles/:roleId
  .delete("/:userId/roles/:roleId", async ({ params, set }) => {
    try {
      await assignRoleUsecase.revoke(params.userId, params.roleId);
      return messageResponse("Role berhasil dicabut dari user.");
    } catch (err: unknown) {
      return errorResponse(set, 400, err);
    }
  }, {
    beforeHandle: rbacGuard("ASSIGN_ROLE"),
    params: t.Object({
      userId: t.String({ description: "UUID dari pengguna target" }),
      roleId: t.String({ description: "UUID dari role yang akan dicabut" }),
    }),
    detail: {
      tags: ["User-Role"],
      summary: "Mencabut Role dari Pengguna",
      description: "Menghapus hak kepemilikan sebuah role dari seorang pengguna tertentu.",
    },
  });
}
