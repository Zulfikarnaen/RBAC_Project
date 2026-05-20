import { createApp } from "./app";

const app = createApp().listen(3000);

console.log(`Server berjalan di http://${app.server?.hostname}:${app.server?.port}`);
console.log(`Dokumentasi OpenAPI (Swagger UI) aktif di http://${app.server?.hostname}:${app.server?.port}/swagger`);
console.log(`
API Endpoints:
-------------------------------------------------
AUTH
  POST   /auth/register
  POST   /auth/login

ROLES
  GET    /roles
  GET    /roles/:id
  POST   /roles                         [CREATE_ROLE]
  PUT    /roles/:id                     [UPDATE_ROLE]
  DELETE /roles/:id                     [DELETE_ROLE]
  POST   /roles/permissions             [ASSIGN_PERMISSION]
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
-------------------------------------------------
`);
