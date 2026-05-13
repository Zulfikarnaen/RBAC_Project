import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { authRoutes } from "./src/interfaces/http/AuthController";
import { roleRoutes } from "./src/interfaces/http/RoleController";
import { permissionRoutes, userRoleRoutes } from "./src/interfaces/http/PermissionController";

const app = new Elysia()
  .use(
    swagger({
      path: "/swagger",
      documentation: {
        info: {
          title: "Dokumentasi REST API RBAC",
          version: "1.0.0",
          description: "Dokumentasi interaktif API untuk Sistem Role-Based Access Control (RBAC) menggunakan Elysia, Bun, dan Prisma.",
        },
        // 1. Menambahkan definisi skema autentikasi JWT (Bearer Token)
        components: {
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "JWT",
              description: "Masukkan token JWT hasil dari endpoint login untuk mengakses rute yang diproteksi.",
            },
          },
        },
        tags: [
          { name: "Auth", description: "Endpoint Autentikasi & Registrasi" },
          { name: "Roles", description: "Manajemen Data Role" },
          { name: "Permissions", description: "Manajemen Data Permission" },
          { name: "User-Role", description: "Manajemen User & Penugasan Role" },
        ],
      },
    })
  )
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
console.log(`📖 Dokumentasi OpenAPI (Swagger UI) aktif di http://${app.server?.hostname}:${app.server?.port}/swagger`);
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