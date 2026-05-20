## Deskripsi
RBAC Project merupakan aplikasi web untuk mengelola autentikasi dan otorisasi berbasis Role-Based Access Control. Aplikasi ini menyediakan proses registrasi, login, proteksi route, pengelolaan role, pengelolaan permission, serta penugasan role dan permission kepada pengguna.

Proyek ini menggunakan struktur monorepo agar frontend dan backend dapat dikelola dalam satu repositori. Frontend dibangun dengan React dan Vite, backend menggunakan Elysia di atas Bun, sedangkan akses database menggunakan Prisma dengan MySQL.

## Fitur
* Registrasi akun pengguna
* Login menggunakan email dan password
* Autentikasi berbasis JWT
* Proteksi route untuk halaman privat
* Penyimpanan sesi pengguna di frontend
* Dashboard pengguna berdasarkan role dan permission
* Manajemen role
* Membuat, melihat, memperbarui, dan menghapus role
* Manajemen permission
* Membuat, melihat, memperbarui, dan menghapus permission
* Assign role ke user
* Revoke role dari user
* Assign permission ke role
* Revoke permission dari role
* Middleware RBAC untuk membatasi akses endpoint
* Dokumentasi API melalui Swagger UI
* Seed data role, permission, dan user demo
* Test API untuk alur RBAC utama

## Teknologi
* Bun
* Elysia
* TypeScript
* Prisma
* MySQL
* JSON Web Token
* React
* Vite
* React Router
* Zustand
* Axios
* Tailwind CSS

## Struktur Folder
    RBAC_Project/
    │── client/
    │   ├── src/
    │   │   ├── components/
    │   │   │   ├── auth/
    │   │   │   ├── layout/
    │   │   │   └── ui/
    │   │   ├── hooks/
    │   │   ├── pages/
    │   │   │   ├── admin/
    │   │   │   ├── auth/
    │   │   │   ├── dashboard/
    │   │   │   ├── editor/
    │   │   │   ├── manager/
    │   │   │   ├── superadmin/
    │   │   │   └── user/
    │   │   ├── services/
    │   │   ├── store/
    │   │   ├── types/
    │   │   ├── utils/
    │   │   ├── App.tsx
    │   │   ├── index.css
    │   │   └── main.tsx
    │   ├── index.html
    │   ├── package.json
    │   ├── tsconfig.json
    │   └── vite.config.ts
    │── prisma/
    │   ├── migrations/
    │   ├── schema.prisma
    │   └── seed.ts
    │── src/
    │   ├── application/
    │   │   └── use-cases/
    │   ├── domain/
    │   │   ├── entities/
    │   │   └── repositories/
    │   ├── infrastructure/
    │   │   └── database/
    │   │       ├── repositories/
    │   │       └── prisma-client.ts
    │   ├── interfaces/
    │   │   └── http/
    │   │       ├── docs/
    │   │       ├── middleware/
    │   │       ├── responses/
    │   │       └── routes/
    │   ├── modules/
    │   ├── shared/
    │   │   ├── config/
    │   │   └── constants/
    │   ├── app.ts
    │   └── server.ts
    │── tests/
    │   └── api-rbac.test.ts
    │── index.ts
    │── package.json
    │── prisma.config.ts
    │── README.md
    └── tsconfig.json

## Cara Menjalankan
1. **Persiapan Lingkungan:** Pastikan komputer sudah terinstal **Bun**, **Node.js**, **npm**, dan **Git**.

2. **Clone Repositori:** Clone repositori dari GitHub.
   ```bash
   git clone https://github.com/Zulfikarnaen/RBAC_Project.git
   ```

3. **Masuk ke Folder Proyek:**
   ```bash
   cd RBAC_Project
   ```

4. **Install Dependensi:**
   ```bash
   npm install
   ```

5. **Siapkan Environment Backend:** Buat file `.env` di root project.
   ```bash
   DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE?ssl-mode=REQUIRED"
   JWT_SECRET="your-secret-key"
   ```

6. **Generate Prisma Client:**
   ```bash
   bunx prisma generate
   ```

7. **Jalankan Seed Database:**
   ```bash
   npm run seed
   ```

8. **Jalankan Frontend dan Backend Bersamaan:**
   ```bash
   npm run dev
   ```

9. **Akses Aplikasi Lokal:** Buka browser dan kunjungi:
   ```bash
   http://localhost:5173
   ```

   Backend lokal berjalan di:
   ```bash
   http://localhost:3000
   ```

   Dokumentasi Swagger tersedia di:
   ```bash
   http://localhost:3000/swagger
   ```

## Script
* `npm run dev` untuk menjalankan frontend dan backend secara bersamaan.
* `npm run dev:backend` untuk menjalankan backend Elysia dengan watch mode.
* `npm run dev:frontend` untuk menjalankan frontend Vite.
* `npm run start` untuk menjalankan backend tanpa watch mode.
* `npm run build` untuk build frontend.
* `npm run gen` untuk generate Prisma Client.
* `npm run seed` untuk menjalankan seed data RBAC.
* `npm run test` untuk menjalankan test API.
* `npm run typecheck` untuk menjalankan typecheck backend dan frontend.

---

Dikembangkan oleh:

* @AndyEmerik1045
* @aurell2701
* @Blackpa77
* @h1101241039-cmd
* @Kings-Bilbil
* @Zulfikarnaen
* @franzxml