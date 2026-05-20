import { Elysia } from "elysia";
import { AssignRoleToUser } from "../application/use-cases/assign-role-to-user";
import { AuthUsecase } from "../application/use-cases/auth-usecase";
import { PermissionUsecase } from "../application/use-cases/permission-usecase";
import { RoleUsecase } from "../application/use-cases/role-usecase";
import { PrismaPermissionRepository } from "../infrastructure/database/repositories/prisma-permission-repository";
import { PrismaRoleRepository } from "../infrastructure/database/repositories/prisma-role-repository";
import { PrismaUserRepository } from "../infrastructure/database/repositories/prisma-user-repository";
import { createAuthRoutes } from "../interfaces/http/routes/auth-routes";
import { createPermissionRoutes, createUserRoleRoutes } from "../interfaces/http/routes/permission-routes";
import { createRoleRoutes } from "../interfaces/http/routes/role-routes";

export function createRbacModule() {
  const userRepo = new PrismaUserRepository();
  const roleRepo = new PrismaRoleRepository();
  const permissionRepo = new PrismaPermissionRepository();

  const authUsecase = new AuthUsecase(userRepo);
  const roleUsecase = new RoleUsecase(roleRepo, permissionRepo);
  const permissionUsecase = new PermissionUsecase(permissionRepo);
  const assignRoleUsecase = new AssignRoleToUser();

  return new Elysia()
    .use(createAuthRoutes(authUsecase))
    .use(createRoleRoutes(roleUsecase))
    .use(createPermissionRoutes(permissionUsecase))
    .use(createUserRoleRoutes(assignRoleUsecase));
}
