import type { ElysiaSwaggerConfig } from "@elysiajs/swagger";

export const swaggerDocumentation: ElysiaSwaggerConfig = {
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
};
