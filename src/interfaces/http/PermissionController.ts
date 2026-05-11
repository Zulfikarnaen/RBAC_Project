import { Elysia, t } from "elysia";
import { PermissionUsecase } from "../../application/usecases/PermissionUsecase";
import { AssignRoleToUser } from "../../application/usecases/AssignRoleToUser";
import { PrismaPermissionRepository } from "../../infrastructure/database/repositories/PrismaPermissionRepository";
import { rbacGuard } from "../middleware/RBACMiddleware";

const permissionRepo = new PrismaPermissionRepository();
const permissionUsecase = new PermissionUsecase(permissionRepo);
const assignRoleUsecase = new AssignRoleToUser();

export const permissionRoutes = new Elysia({ prefix: "/permissions" })

  // GET /permissions
  .get("/", async ({ set }) => {
    try {
      const perms = await permissionUsecase.getAllPermissions();
      return { success: true, data: perms };
    } catch (err: unknown) {
      set.status = 500;
      return { success: false, message: (err as Error).message };
    }
  })

  // GET /permissions/:id
  .get("/:id", async ({ params, set }) => {
    try {
      const perm = await permissionUsecase.getPermissionById(params.id);
      return { success: true, data: perm };
    } catch (err: unknown) {
      set.status = 404;
      return { success: false, message: (err as Error).message };
    }
  })

  // POST /permissions
  .post("/", async ({ body, set }) => {
    try {
      const perm = await permissionUsecase.createPermission(body);
      set.status = 201;
      return { success: true, data: perm };
    } catch (err: unknown) {
      set.status = 400;
      return { success: false, message: (err as Error).message };
    }
  }, {
    beforeHandle: rbacGuard("CREATE_PERMISSION"),
    body: t.Object({
      name: t.String({ minLength: 2 }),
      description: t.Optional(t.String()),
    }),
  })

  // PUT /permissions/:id
  .put("/:id", async ({ params, body, set }) => {
    try {
      const perm = await permissionUsecase.updatePermission(params.id, body);
      return { success: true, data: perm };
    } catch (err: unknown) {
      set.status = 400;
      return { success: false, message: (err as Error).message };
    }
  }, {
    beforeHandle: rbacGuard("UPDATE_PERMISSION"),
    body: t.Object({
      name: t.Optional(t.String({ minLength: 2 })),
      description: t.Optional(t.String()),
    }),
  })

  // DELETE /permissions/:id
  .delete("/:id", async ({ params, set }) => {
    try {
      await permissionUsecase.deletePermission(params.id);
      return { success: true, message: "Permission berhasil dihapus." };
    } catch (err: unknown) {
      set.status = 404;
      return { success: false, message: (err as Error).message };
    }
  }, {
    beforeHandle: rbacGuard("DELETE_PERMISSION"),
  });

export const userRoleRoutes = new Elysia({ prefix: "/users" })

  // GET /users/:userId/roles
  .get("/:userId/roles", async ({ params, set }) => {
    try {
      const roles = await assignRoleUsecase.getRolesOfUser(params.userId);
      return { success: true, data: roles };
    } catch (err: unknown) {
      set.status = 500;
      return { success: false, message: (err as Error).message };
    }
  })

  // POST /users/:userId/roles — assign role ke user
  .post("/:userId/roles", async ({ params, body, set }) => {
    try {
      await assignRoleUsecase.execute(params.userId, body.roleId);
      return { success: true, message: "Role berhasil di-assign ke user." };
    } catch (err: unknown) {
      set.status = 400;
      return { success: false, message: (err as Error).message };
    }
  }, {
    beforeHandle: rbacGuard("ASSIGN_ROLE"),
    body: t.Object({ roleId: t.String() }),
  })

  // DELETE /users/:userId/roles/:roleId — revoke role dari user
  .delete("/:userId/roles/:roleId", async ({ params, set }) => {
    try {
      await assignRoleUsecase.revoke(params.userId, params.roleId);
      return { success: true, message: "Role berhasil dicabut dari user." };
    } catch (err: unknown) {
      set.status = 400;
      return { success: false, message: (err as Error).message };
    }
  }, {
    beforeHandle: rbacGuard("ASSIGN_ROLE"),
  });
