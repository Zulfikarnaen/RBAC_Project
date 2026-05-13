# Dokumentasi Backend RBAC

Backend ini memakai Bun, Elysia, Prisma v6, MySQL, dan JWT untuk autentikasi berbasis role.

## Setup

1. Install dependency:
   ```bash
   bun install
   ```
2. Pastikan `.env` berisi:
   ```bash
   DATABASE_URL="mysql://<USER>:<PASSWORD>@<HOST>:<PORT>/<DATABASE>?ssl-mode=REQUIRED"
   ```
3. Generate Prisma Client:
   ```bash
   bunx prisma generate
   ```
4. Jalankan seed:
   ```bash
   bun run seed
   ```
5. Jalankan server:
   ```bash
   bun run start
   ```

Swagger UI tersedia di `http://localhost:3000/swagger`.

## Seeder

File `prisma/seed.ts` mengisi data awal secara idempotent:

- Permission: `CREATE_USER`, `READ_USER`, `UPDATE_USER`, `DELETE_USER`, `CREATE_ROLE`, `READ_ROLE`, `UPDATE_ROLE`, `DELETE_ROLE`, `CREATE_PERMISSION`, `READ_PERMISSION`, `UPDATE_PERMISSION`, `DELETE_PERMISSION`, `ASSIGN_PERMISSION`, `ASSIGN_ROLE`.
- Role: `SUPERADMIN`, `ADMIN`, `USER`.
- User demo:
  - `superadmin@test.com` / `Admin123!` dengan role `SUPERADMIN`.
  - `admin@test.com` / `Admin123!` dengan role `ADMIN`.
  - `user@test.com` / `User123!` dengan role `USER`.

## Testing API

Jalankan:

```bash
bun test
```

Test berada di `tests/api-rbac.test.ts` dan mencakup:

- Health check `GET /`.
- Login akun hasil seed melalui `POST /auth/login`.
- Akses SUPERADMIN membuat role lewat `POST /roles`.
- Penolakan USER saat mencoba `POST /roles`.
- Penolakan request protected tanpa Bearer token.

## Testing Role Access Manual

Login sebagai SUPERADMIN:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@test.com","password":"Admin123!"}'
```

Gunakan token dari response untuk membuat role:

```bash
curl -X POST http://localhost:3000/roles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_SUPERADMIN>" \
  -d '{"name":"MANAGER","description":"Role manager"}'
```

Login sebagai USER:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"User123!"}'
```

Jika token USER dipakai untuk `POST /roles`, backend mengembalikan `403` karena role `USER` hanya memiliki `READ_USER`.
