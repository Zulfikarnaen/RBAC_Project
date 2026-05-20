# Dokumentasi Testing Backend RBAC

Dokumen ini adalah panduan step by step untuk menyiapkan, menjalankan, dan menguji backend RBAC dari awal sampai selesai. Backend memakai Bun, Elysia, Prisma v6, MySQL, JWT, dan Swagger UI.

## 1. Prasyarat

Pastikan tool berikut sudah tersedia di mesin lokal:

```bash
bun --version
git --version
```

Project ini membutuhkan koneksi ke database MySQL. Konfigurasi koneksi database dibaca oleh Prisma dari konfigurasi project dan/atau environment lokal. Jika memakai `.env`, gunakan format berikut:

```bash
DATABASE_URL="mysql://<USER>:<PASSWORD>@<HOST>:<PORT>/<DATABASE>?ssl-mode=REQUIRED"
JWT_SECRET="<secret-lokal-untuk-token-jwt>"
```

Catatan:

- Jangan commit file `.env` atau kredensial database.
- Gunakan `JWT_SECRET` yang sama saat login dan saat mengakses endpoint protected. Jika tidak diisi, aplikasi memakai nilai default dari kode.

## 2. Setup Project

Jalankan semua perintah dari root project:

```bash
cd /Users/franzxml/Programming/RBAC_Project
```

Install dependency:

```bash
bun install
```

Generate Prisma Client:

```bash
bunx prisma generate
```

Jika ingin memakai script yang sudah tersedia di `package.json`, bisa juga menjalankan:

```bash
bun run gen
```

## 3. Cek Database dan Migrasi

Pastikan Prisma bisa terhubung ke database:

```bash
bunx prisma db pull
```

Jika database masih kosong dan migration project perlu diterapkan, jalankan:

```bash
bunx prisma migrate deploy
```

Untuk melihat data melalui Prisma Studio:

```bash
bunx prisma studio
```

Prisma Studio biasanya tersedia di `http://localhost:5555`.

## 4. Jalankan Seeder

Seeder berada di `prisma/seed.ts` dan bersifat idempotent, sehingga aman dijalankan ulang untuk memperbarui data dasar.

```bash
bun run seed
```

Seeder membuat permission berikut:

- `CREATE_USER`, `READ_USER`, `UPDATE_USER`, `DELETE_USER`
- `CREATE_ROLE`, `READ_ROLE`, `UPDATE_ROLE`, `DELETE_ROLE`
- `CREATE_PERMISSION`, `READ_PERMISSION`, `UPDATE_PERMISSION`, `DELETE_PERMISSION`
- `ASSIGN_PERMISSION`, `ASSIGN_ROLE`

Seeder membuat role berikut:

- `SUPERADMIN`: memiliki semua permission.
- `ADMIN`: memiliki akses manajemen user terbatas, baca role, assign role, dan baca permission.
- `USER`: hanya memiliki `READ_USER`.

Seeder membuat akun demo berikut:

| Role | Email | Password |
| --- | --- | --- |
| SUPERADMIN | `superadmin@test.com` | `Admin123!` |
| ADMIN | `admin@test.com` | `Admin123!` |
| USER | `user@test.com` | `User123!` |

Kriteria selesai untuk langkah ini:

- Command `bun run seed` selesai tanpa error.
- Output terminal menampilkan daftar permission, role, dan akun demo.

## 5. Jalankan Server Backend

Jalankan server:

```bash
bun run start
```

Untuk mode development dengan watch:

```bash
bun run dev
```

Server berjalan di:

```text
http://localhost:3000
```

Swagger UI tersedia di:

```text
http://localhost:3000/swagger
```

Cek health check:

```bash
curl http://localhost:3000/
```

Response sukses:

```json
{
  "success": true,
  "message": "RBAC API is running"
}
```

## 6. Test Otomatis

Test otomatis berada di `tests/api-rbac.test.ts`.

Jalankan:

```bash
bun test
```

Test akan:

1. Menjalankan seed sebelum test.
2. Mengecek health check `GET /`.
3. Login akun seed melalui `POST /auth/login`.
4. Memastikan token JWT berhasil dibuat.
5. Memastikan `SUPERADMIN` bisa membuat role melalui `POST /roles`.
6. Memastikan `USER` ditolak saat mencoba membuat role.
7. Memastikan endpoint protected menolak request tanpa Bearer token.
8. Membersihkan data test dengan prefix `TEST_`.

Kriteria selesai:

- Semua test berstatus pass.
- Tidak ada error koneksi database.
- Tidak ada error autentikasi untuk akun hasil seed.

## 7. Test Manual dengan Curl

Pastikan server sedang berjalan sebelum menjalankan curl di bawah.

### 7.1 Login SUPERADMIN

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@test.com","password":"Admin123!"}'
```

Response sukses berisi `data.token`. Simpan token tersebut sebagai `TOKEN_SUPERADMIN`:

```bash
export TOKEN_SUPERADMIN="<TOKEN_DARI_RESPONSE_LOGIN_SUPERADMIN>"
```

### 7.2 Cek Role dengan SUPERADMIN Token

```bash
curl http://localhost:3000/roles \
  -H "Authorization: Bearer $TOKEN_SUPERADMIN"
```

Endpoint `GET /roles` tidak memakai guard permission di kode saat ini, tetapi tetap berguna untuk memastikan data role dari seed sudah tersedia.

### 7.3 Buat Role Baru sebagai SUPERADMIN

```bash
curl -X POST http://localhost:3000/roles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_SUPERADMIN" \
  -d '{"name":"MANAGER","description":"Role manager untuk testing manual"}'
```

Response sukses memakai status `201` dan mengembalikan data role baru.

Jika nama role sudah pernah dibuat, gunakan nama lain, misalnya:

```bash
curl -X POST http://localhost:3000/roles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_SUPERADMIN" \
  -d '{"name":"MANAGER_TEST_001","description":"Role manager untuk testing manual"}'
```

### 7.4 Login USER

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"User123!"}'
```

Simpan token USER:

```bash
export TOKEN_USER="<TOKEN_DARI_RESPONSE_LOGIN_USER>"
```

### 7.5 Pastikan USER Ditolak Membuat Role

```bash
curl -X POST http://localhost:3000/roles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_USER" \
  -d '{"name":"ROLE_TIDAK_BOLEH_DIBUAT","description":"Testing akses user biasa"}'
```

Response yang diharapkan:

```json
{
  "success": false,
  "message": "Akses ditolak. Membutuhkan permission: CREATE_ROLE"
}
```

Status HTTP yang diharapkan adalah `403`.

### 7.6 Pastikan Request Tanpa Token Ditolak

```bash
curl -X POST http://localhost:3000/permissions \
  -H "Content-Type: application/json" \
  -d '{"name":"EXPORT_REPORT","description":"Testing permission tanpa token"}'
```

Response yang diharapkan:

```json
{
  "success": false,
  "message": "Token tidak ditemukan."
}
```

Status HTTP yang diharapkan adalah `401`.

## 8. Test via Swagger UI

1. Jalankan server dengan `bun run start` atau `bun run dev`.
2. Buka `http://localhost:3000/swagger`.
3. Jalankan endpoint `POST /auth/login` dengan akun `superadmin@test.com`.
4. Ambil token JWT dari response.
5. Klik tombol authorize di Swagger UI.
6. Masukkan token dengan format Bearer token sesuai UI Swagger.
7. Coba endpoint protected seperti `POST /roles`, `POST /permissions`, atau `POST /users/:userId/roles`.

Kriteria selesai:

- Login menghasilkan token JWT.
- Endpoint protected berhasil jika token memiliki permission yang sesuai.
- Endpoint protected menolak token yang tidak memiliki permission.

## 9. Daftar Endpoint Penting

### Auth

| Method | Endpoint | Keterangan |
| --- | --- | --- |
| `POST` | `/auth/register` | Registrasi user baru |
| `POST` | `/auth/login` | Login dan mendapatkan JWT |

### Roles

| Method | Endpoint | Permission |
| --- | --- | --- |
| `GET` | `/roles` | Tidak memakai guard di route saat ini |
| `GET` | `/roles/:id` | Tidak memakai guard di route saat ini |
| `POST` | `/roles` | `CREATE_ROLE` |
| `PUT` | `/roles/:id` | `UPDATE_ROLE` |
| `DELETE` | `/roles/:id` | `DELETE_ROLE` |
| `POST` | `/roles/:id/permissions` | `ASSIGN_PERMISSION` |
| `DELETE` | `/roles/:id/permissions/:permissionId` | `ASSIGN_PERMISSION` |

### Permissions

| Method | Endpoint | Permission |
| --- | --- | --- |
| `GET` | `/permissions` | Tidak memakai guard di route saat ini |
| `GET` | `/permissions/:id` | Tidak memakai guard di route saat ini |
| `POST` | `/permissions` | `CREATE_PERMISSION` |
| `PUT` | `/permissions/:id` | `UPDATE_PERMISSION` |
| `DELETE` | `/permissions/:id` | `DELETE_PERMISSION` |

### User Role

| Method | Endpoint | Permission |
| --- | --- | --- |
| `GET` | `/users/:userId/roles` | Tidak memakai guard di route saat ini |
| `POST` | `/users/:userId/roles` | `ASSIGN_ROLE` |
| `DELETE` | `/users/:userId/roles/:roleId` | `ASSIGN_ROLE` |

## 10. Troubleshooting

### Bun command tidak ditemukan

Install Bun terlebih dahulu, lalu buka terminal baru:

```bash
curl -fsSL https://bun.sh/install | bash
```

### Prisma Client belum dibuat

Gejala umum:

```text
Cannot find module '@prisma/client'
```

Solusi:

```bash
bun install
bunx prisma generate
```

### Database tidak bisa terkoneksi

Periksa:

- Nilai `DATABASE_URL`.
- Host, port, username, password, dan nama database.
- Koneksi internet atau VPN jika database berada di cloud.
- Parameter SSL jika database cloud mewajibkan SSL.

Uji ulang dengan:

```bash
bunx prisma db pull
```

### Login gagal

Periksa:

- Seeder sudah dijalankan dengan `bun run seed`.
- Email dan password sesuai tabel akun demo.
- Database yang dipakai server sama dengan database yang dipakai seeder.

### Token ditolak

Periksa:

- Header harus berbentuk `Authorization: Bearer <TOKEN>`.
- Token belum kedaluwarsa.
- `JWT_SECRET` saat login sama dengan `JWT_SECRET` saat endpoint protected memverifikasi token.

### Role atau permission sudah ada

Gunakan nama baru untuk data testing. Untuk test manual, gunakan prefix yang jelas seperti `TEST_` atau `MANUAL_`.

## 11. Checklist Selesai

Backend testing dianggap selesai jika semua poin berikut terpenuhi:

- Dependency berhasil diinstall.
- Prisma Client berhasil digenerate.
- Database bisa diakses.
- Seeder berhasil dijalankan.
- Server berjalan di `http://localhost:3000`.
- Swagger UI bisa dibuka di `http://localhost:3000/swagger`.
- `curl http://localhost:3000/` mengembalikan `success: true`.
- `bun test` berhasil tanpa test gagal.
- SUPERADMIN bisa mengakses endpoint protected sesuai permission.
- USER ditolak saat mengakses endpoint yang membutuhkan permission lebih tinggi.
- Request protected tanpa token ditolak dengan status `401`.
