import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { authRoutes } from "./interfaces/http/AuthController";
import { roleRoutes } from "./interfaces/http/RoleController";
import { permissionRoutes, userRoleRoutes } from "./interfaces/http/PermissionController";

export function createApp() {
  return new Elysia()
    .use(
      swagger({
        path: "/swagger",
        documentation: {
          info: {
            title: "Dokumentasi REST API RBAC",
            version: "1.0.0",
            description:
              "Dokumentasi interaktif API untuk Sistem Role-Based Access Control (RBAC) menggunakan Elysia, Bun, dan Prisma.",
          },
          components: {
            securitySchemes: {
              bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
                description:
                  "Masukkan token JWT hasil dari endpoint login untuk mengakses rute yang diproteksi.",
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
      message: "RBAC API is running",
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
    });
}
