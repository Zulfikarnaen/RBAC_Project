import { Elysia, t } from "elysia";
import { RoleUsecase } from "../../application/usecases/RoleUsecase";
import { PrismaRoleRepository } from "../../infrastructure/database/repositories/PrismaRoleRepository";
import { PrismaPermissionRepository } from "../../infrastructure/database/repositories/PrismaPermissionRepository";
import { rbacGuard } from "../middleware/RBACMiddleware";

const roleRepo = new PrismaRoleRepository();
const permissionRepo = new PrismaPermissionRepository();
const roleUsecase = new RoleUsecase(roleRepo, permissionRepo);

export const roleRoutes = new Elysia({ prefix: "/roles" })

  // GET /roles
  .get("/", async ({ set }) => {
    try {
      const roles = await roleUsecase.getAllRoles();
      return { success: true, data: roles };
    } catch (err: unknown) {
      set.status = 500;
      return { success: false, message: (err as Error).message };
    }
  })

  // GET /roles/:id
  .get("/:id", async ({ params, set }) => {
    try {
      const role = await roleUsecase.getRoleById(params.id);
      return { success: true, data: role };
    } catch (err: unknown) {
      set.status = 404;
      return { success: false, message: (err as Error).message };
    }
  })

  // POST /roles
  .post("/", async ({ body, set }) => {
    try {
      const role = await roleUsecase.createRole(body);
      set.status = 201;
      return { success: true, data: role };
    } catch (err: unknown) {
      set.status = 400;
      return { success: false, message: (err as Error).message };
    }
  }, {
    beforeHandle: rbacGuard("CREATE_ROLE"),
    body: t.Object({
      name: t.String({ minLength: 2 }),
      description: t.Optional(t.String()),
    }),
  })

  // PUT /roles/:id
  .put("/:id", async ({ params, body, set }) => {
    try {
      const role = await roleUsecase.updateRole(params.id, body);
      return { success: true, data: role };
    } catch (err: unknown) {
      set.status = 400;
      return { success: false, message: (err as Error).message };
    }
  }, {
    beforeHandle: rbacGuard("UPDATE_ROLE"),
    body: t.Object({
      name: t.Optional(t.String({ minLength: 2 })),
      description: t.Optional(t.String()),
    }),
  })

  // DELETE /roles/:id
  .delete("/:id", async ({ params, set }) => {
    try {
      await roleUsecase.deleteRole(params.id);
      return { success: true, message: "Role berhasil dihapus." };
    } catch (err: unknown) {
      set.status = 404;
      return { success: false, message: (err as Error).message };
    }
  }, {
    beforeHandle: rbacGuard("DELETE_ROLE"),
  })

  // POST /roles/:id/permissions — assign permission ke role
  .post("/:id/permissions", async ({ params, body, set }) => {
    try {
      await roleUsecase.assignPermission(params.id, body.permissionId);
      return { success: true, message: "Permission berhasil ditambahkan ke role." };
    } catch (err: unknown) {
      set.status = 400;
      return { success: false, message: (err as Error).message };
    }
  }, {
    beforeHandle: rbacGuard("ASSIGN_PERMISSION"),
    body: t.Object({ permissionId: t.String() }),
  })

  // DELETE /roles/:id/permissions/:permissionId — revoke permission dari role
  .delete("/:id/permissions/:permissionId", async ({ params, set }) => {
    try {
      await roleUsecase.revokePermission(params.id, params.permissionId);
      return { success: true, message: "Permission berhasil dicabut dari role." };
    } catch (err: unknown) {
      set.status = 400;
      return { success: false, message: (err as Error).message };
    }
  }, {
    beforeHandle: rbacGuard("ASSIGN_PERMISSION"),
  });
