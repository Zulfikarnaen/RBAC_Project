import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { cors } from "@elysiajs/cors";
import { swaggerDocumentation } from "./interfaces/http/docs/swagger-documentation";
import { createRbacModule } from "./modules/rbac-module";

export function createApp() {
  return new Elysia()
    .use(cors())
    .use(swagger(swaggerDocumentation))
    .get("/", () => ({
      success: true,
      message: "RBAC API is running",
    }))
    .use(createRbacModule())
    .onError(({ code, error, set }) => {
      if (code === "NOT_FOUND") {
        set.status = 404;
        return { success: false, message: "Endpoint tidak ditemukan." };
      }
      set.status = 500;
      return { success: false, message: (error as Error).message };
    });
}
