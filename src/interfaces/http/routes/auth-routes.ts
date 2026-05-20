import { Elysia, t } from "elysia";
import { AuthUsecase } from "../../../application/use-cases/auth-usecase";
import { createdDataResponse, dataResponse, errorResponse } from "../responses/http-response";

export function createAuthRoutes(authUsecase: AuthUsecase) {
  return new Elysia({ prefix: "/auth" })

  // POST /auth/register
  .post("/register", async ({ body, set }) => {
    try {
      const user = await authUsecase.register(body);
      return createdDataResponse(set, user);
    } catch (err: unknown) {
      return errorResponse(set, 400, err);
    }
  }, {
    body: t.Object({
      username: t.String({ minLength: 3, default: "superadmin" }),
      email: t.String({ format: "email", default: "superadmin@test.com" }),
      password: t.String({ minLength: 6, default: "Admin123!" }),
    }),
    // Metadata OpenAPI untuk rute Register
    detail: {
      tags: ["Auth"],
      summary: "Registrasi Pengguna Baru",
      description: "Mendaftarkan pengguna baru ke dalam sistem. Endpoint ini memvalidasi email agar tidak duplikat dan melakukan hashing password secara otomatis.",
    },
  })

  // POST /auth/login
  .post("/login", async ({ body, set }) => {
    try {
      const result = await authUsecase.login(body);
      return dataResponse(result);
    } catch (err: unknown) {
      return errorResponse(set, 401, err);
    }
  }, {
    body: t.Object({
      email: t.String({ format: "email", default: "superadmin@test.com" }),
      password: t.String({ minLength: 6, default: "Admin123!" }),
    }),
    // Metadata OpenAPI untuk rute Login
    detail: {
      tags: ["Auth"],
      summary: "Login Pengguna",
      description: "Melakukan autentikasi pengguna menggunakan email dan password. Mengembalikan data profil singkat beserta token JWT untuk mengakses rute terproteksi.",
    },
  });
}
