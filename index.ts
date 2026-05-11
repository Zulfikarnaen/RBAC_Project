import { Elysia } from "elysia";
import { authRoutes } from "./src/interfaces/http/AuthController";
import { roleRoutes } from "./src/interfaces/http/RoleController";
import { permissionRoutes, userRoleRoutes } from "./src/interfaces/http/PermissionController";

const app = new Elysia()
  .get("/", () => ({
    success: true,
    message: "RBAC API is running 🚀",
  }))
  .use(authRoutes)
  .use(roleRoutes)
  .use(permissionRoutes)
  .use(userRoleRoutes)
  .onError(({ code, error, set }) => {
    if (code === "NOT_FOUND") {
      set.status = 404;
      return { success: false, message: "Endpoint tidak ditemukan." };
    }
    set.status = 500;
    return { success: false, message: (error as Error).message };
  })
  .listen(3000);

console.log(`✅ Server berjalan di http://${app.server?.hostname}:${app.server?.port}`);
console.log(`
📦 API Endpoints:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AUTH
  POST   /auth/register
  POST   /auth/login

ROLES
  GET    /roles
  GET    /roles/:id
  POST   /roles                         [CREATE_ROLE]
  PUT    /roles/:id                     [UPDATE_ROLE]
  DELETE /roles/:id                     [DELETE_ROLE]
  POST   /roles/:id/permissions         [ASSIGN_PERMISSION]
  DELETE /roles/:id/permissions/:permId [ASSIGN_PERMISSION]

PERMISSIONS
  GET    /permissions
  GET    /permissions/:id
  POST   /permissions                   [CREATE_PERMISSION]
  PUT    /permissions/:id               [UPDATE_PERMISSION]
  DELETE /permissions/:id               [DELETE_PERMISSION]

USER-ROLE
  GET    /users/:userId/roles
  POST   /users/:userId/roles           [ASSIGN_ROLE]
  DELETE /users/:userId/roles/:roleId   [ASSIGN_ROLE]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
