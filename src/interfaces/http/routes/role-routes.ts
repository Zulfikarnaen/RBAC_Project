import { Elysia, t } from "elysia";
import { RoleUsecase } from "../../../application/use-cases/role-usecase";
import { rbacGuard } from "../middleware/rbac-middleware";
import { createdDataResponse, dataResponse, errorResponse, messageResponse } from "../responses/http-response";

export function createRoleRoutes(roleUsecase: RoleUsecase) {
  return new Elysia({ prefix: "/roles" })

  // GET /roles
  .get("/", async ({ set }) => {
    try {
      const roles = await roleUsecase.getAllRoles();
      return dataResponse(roles);
    } catch (err: unknown) {
      return errorResponse(set, 500, err);
    }
  }, {
    detail: {
      tags: ["Roles"],
      summary: "Daftar Semua Role",
      description: "Mengambil daftar seluruh role yang tersedia di dalam sistem RBAC tanpa menyertakan detail permission masing-masing.",
    },
  })

  // GET /roles/:id
  .get("/:id", async ({ params, set }) => {
    try {
      const role = await roleUsecase.getRoleById(params.id);
      return dataResponse(role);
    } catch (err: unknown) {
      return errorResponse(set, 404, err);
    }
  }, {
    params: t.Object({
      id: t.String({ description: "UUID dari role yang ingin dicari" }),
    }),
    detail: {
      tags: ["Roles"],
      summary: "Detail Role Berdasarkan ID",
      description: "Mengambil informasi detail sebuah role berdasarkan UUID, lengkap dengan struktur array permission yang tertaut pada role tersebut.",
    },
  })

  // POST /roles
  .post("/", async ({ body, set }) => {
    try {
      const role = await roleUsecase.createRole(body);
      return createdDataResponse(set, role);
    } catch (err: unknown) {
      return errorResponse(set, 400, err);
    }
  }, {
    beforeHandle: rbacGuard("CREATE_ROLE"),
    body: t.Object({
      name: t.String({ minLength: 2, default: "MANAGER" }),
      description: t.Optional(t.String({ default: "Manajer divisi dengan akses terbatas" })),
    }),
    detail: {
      tags: ["Roles"],
      summary: "Membuat Role Baru",
      description: "Menambahkan entitas role baru ke dalam database. Endpoint ini diproteksi dan memerlukan header Authorization berisikan Bearer Token dengan hak akses CREATE_ROLE.",
    },
  })

  // PUT /roles/:id
  .put("/:id", async ({ params, body, set }) => {
    try {
      const role = await roleUsecase.updateRole(params.id, body);
      return dataResponse(role);
    } catch (err: unknown) {
      return errorResponse(set, 400, err);
    }
  }, {
    beforeHandle: rbacGuard("UPDATE_ROLE"),
    params: t.Object({
      id: t.String({ description: "UUID dari role yang akan diperbarui" }),
    }),
    body: t.Object({
      name: t.Optional(t.String({ minLength: 2, default: "MANAGER_UPDATED" })),
      description: t.Optional(t.String({ default: "Deskripsi role hasil pembaruan" })),
    }),
    detail: {
      tags: ["Roles"],
      summary: "Memperbarui Data Role",
      description: "Mengubah atribut nama atau deskripsi dari role yang sudah ada. Membutuhkan izin UPDATE_ROLE.",
    },
  })

  // DELETE /roles/:id
  .delete("/:id", async ({ params, set }) => {
    try {
      await roleUsecase.deleteRole(params.id);
      return messageResponse("Role berhasil dihapus.");
    } catch (err: unknown) {
      return errorResponse(set, 404, err);
    }
  }, {
    beforeHandle: rbacGuard("DELETE_ROLE"),
    params: t.Object({
      id: t.String({ description: "UUID dari role yang akan dihapus" }),
    }),
    detail: {
      tags: ["Roles"],
      summary: "Menghapus Role",
      description: "Menghapus entitas role dari database secara permanen. Efek kaskade (cascade) akan mencabut penugasan role ini dari user yang memilikinya.",
    },
  })

  // POST /roles/permissions
  .post("/permissions", async ({ body, set }) => {
    try {
      await roleUsecase.assignPermission(body.roleId, body.permissionId);
      return messageResponse("Permission berhasil ditambahkan ke role.");
    } catch (err: unknown) {
      return errorResponse(set, 400, err);
    }
  }, {
    beforeHandle: rbacGuard("ASSIGN_PERMISSION"),
    body: t.Object({
      roleId: t.String({
        description: "UUID role yang akan diberi permission. Ambil dari response GET /roles.",
        default: "8140d0f3-de5f-4100-ac2d-c4ef40b689d0",
      }),
      permissionId: t.String({
        description: "UUID permission yang akan ditautkan. Ambil dari response GET /permissions.",
        default: "03cd64f4-dcd7-4e5c-8bce-07fa9f84e9fb",
      }),
    }),
    detail: {
      tags: ["Roles"],
      summary: "Menautkan Permission ke Role melalui Body",
      description: "Endpoint alternatif tanpa path parameter. Isi roleId dan permissionId langsung di request body.",
    },
  })

  // POST /roles/:id/permissions
  .post("/:id/permissions", async ({ params, body, set }) => {
    try {
      await roleUsecase.assignPermission(params.id, body.permissionId);
      return messageResponse("Permission berhasil ditambahkan ke role.");
    } catch (err: unknown) {
      return errorResponse(set, 400, err);
    }
  }, {
    beforeHandle: rbacGuard("ASSIGN_PERMISSION"),
    params: t.Object({
      id: t.String({ description: "UUID dari role induk" }),
    }),
    body: t.Object({
      permissionId: t.String({ description: "UUID dari permission yang akan ditautkan" }),
    }),
    detail: {
      tags: ["Roles"],
      summary: "Menautkan Permission ke Role",
      description: "Memberikan sebuah permission spesifik kepada suatu role dengan menambahkan data relasi pada tabel pivot RolePermission.",
    },
  })

  // DELETE /roles/:id/permissions/:permissionId
  .delete("/:id/permissions/:permissionId", async ({ params, set }) => {
    try {
      await roleUsecase.revokePermission(params.id, params.permissionId);
      return messageResponse("Permission berhasil dicabut dari role.");
    } catch (err: unknown) {
      return errorResponse(set, 400, err);
    }
  }, {
    beforeHandle: rbacGuard("ASSIGN_PERMISSION"),
    params: t.Object({
      id: t.String({ description: "UUID dari role induk" }),
      permissionId: t.String({ description: "UUID dari permission yang akan dicabut" }),
    }),
    detail: {
      tags: ["Roles"],
      summary: "Mencabut Permission dari Role",
      description: "Menghapus tautan relasi antara role dan permission dari tabel pivot. Membutuhkan izin akses ASSIGN_PERMISSION.",
    },
  });
}
