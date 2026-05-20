# RBAC Project (Prisma + MySQL + Bun)

## Setup Project

### 1. Clone project
```bash
git clone https://github.com/Zulfikarnaen/RBAC_Project.git
cd RBAC_Project
```

### 2. Install dependency
```bash
bun install
```

###3. Tambah file .env
Buat file .env di root project:
```bash
DATABASE_URL="mysql://avnadmin:PASSWORD@host:port/defaultdb?ssl-mode=REQUIRED"
```

### 4. Generate Prisma Client
```bash
bunx prisma generate
```

### 5. Cek database (Prisma Studio)
```bash
bunx prisma studio
```
##