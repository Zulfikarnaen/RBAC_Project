import { Elysia, t } from "elysia";
import { AuthUsecase } from "../../application/usecases/AuthUsecase";
import { PrismaUserRepository } from "../../infrastructure/database/repositories/PrismaUserRepository";

const userRepo = new PrismaUserRepository();
const authUsecase = new AuthUsecase(userRepo);

export const authRoutes = new Elysia({ prefix: "/auth" })

  // POST /auth/register
  .post("/register", async ({ body, set }) => {
    try {
      const user = await authUsecase.register(body);
      set.status = 201;
      return { success: true, data: user };
    } catch (err: unknown) {
      set.status = 400;
      return { success: false, message: (err as Error).message };
    }
  }, {
    body: t.Object({
      username: t.String({ minLength: 3 }),
      email: t.String({ format: "email" }),
      password: t.String({ minLength: 6 }),
    }),
  })

  // POST /auth/login
  .post("/login", async ({ body, set }) => {
    try {
      const result = await authUsecase.login(body);
      return { success: true, data: result };
    } catch (err: unknown) {
      set.status = 401;
      return { success: false, message: (err as Error).message };
    }
  }, {
    body: t.Object({
      email: t.String({ format: "email" }),
      password: t.String({ minLength: 6 }),
    }),
  });
