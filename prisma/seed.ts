import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const PERMISSIONS = [
  { name: "CREATE_USER",       description: "Membuat user baru" },
  { name: "READ_USER",         description: "Melihat data user" },
  { name: "UPDATE_USER",       description: "Mengubah data user" },
  { name: "DELETE_USER",       description: "Menghapus user" },
  { name: "CREATE_ROLE",       description: "Membuat role baru" },
  { name: "READ_ROLE",         description: "Melihat data role" },
  { name: "UPDATE_ROLE",       description: "Mengubah data role" },
  { name: "DELETE_ROLE",       description: "Menghapus role" },
  { name: "CREATE_PERMISSION", description: "Membuat permission baru" },
  { name: "READ_PERMISSION",   description: "Melihat data permission" },
  { name: "UPDATE_PERMISSION", description: "Mengubah data permission" },
  { name: "DELETE_PERMISSION", description: "Menghapus permission" },
  { name: "ASSIGN_PERMISSION", description: "Assign/revoke permission ke role" },
  { name: "ASSIGN_ROLE",       description: "Assign/revoke role ke user" },
];

const ROLES = [
  {
    name: "SUPERADMIN",
    description: "Administrator tertinggi dengan semua akses",
    permissions: PERMISSIONS.map((p) => p.name),
  },
  {
    name: "ADMIN",
    description: "Administrator dengan akses manajemen user & role",
    permissions: [
      "CREATE_USER", "READ_USER", "UPDATE_USER", "DELETE_USER",
      "READ_ROLE", "ASSIGN_ROLE", "READ_PERMISSION",
    ],
  },
  {
    name: "USER",
    description: "Pengguna biasa — hanya bisa melihat data sendiri",
    permissions: ["READ_USER"],
  },
];

const USERS = [
  {
    username: "superadmin",
    email: "superadmin@test.com",
    password: "Admin123!",
    role: "SUPERADMIN",
  },
  {
    username: "admin",
    email: "admin@test.com",
    password: "Admin123!",
    role: "ADMIN",
  },
  {
    username: "user",
    email: "user@test.com",
    password: "User123!",
    role: "USER",
  },
];

export async function seed() {
  console.log("Memulai seeding data RBAC...\n");

  console.log("Menyiapkan permissions...");
  const createdPermissions: Record<string, string> = {};

  for (const perm of PERMISSIONS) {
    const result = await db.permission.upsert({
      where: { name: perm.name },
      update: { description: perm.description },
      create: perm,
    });
    createdPermissions[result.name] = result.id;
    console.log(`  - ${result.name}`);
  }

  console.log("\nMenyiapkan roles dan mengassign permissions...");
  const createdRoles: Record<string, string> = {};

  for (const roleDef of ROLES) {
    const role = await db.role.upsert({
      where: { name: roleDef.name },
      update: { description: roleDef.description },
      create: { name: roleDef.name, description: roleDef.description },
    });

    for (const permName of roleDef.permissions) {
      const permId = createdPermissions[permName];
      if (!permId) continue;
      await db.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: permId } },
        update: {},
        create: { roleId: role.id, permissionId: permId },
      });
    }

    createdRoles[role.name] = role.id;
    console.log(`  - ${role.name}: ${roleDef.permissions.length} permissions`);
  }

  console.log("\nMenyiapkan user demo dan assignment role...");

  for (const userDef of USERS) {
    const hashedPassword = await Bun.password.hash(userDef.password, {
      algorithm: "bcrypt",
      cost: 10,
    });
    const user = await db.user.upsert({
      where: { email: userDef.email },
      update: {
        username: userDef.username,
        password: hashedPassword,
      },
      create: {
        username: userDef.username,
        email: userDef.email,
        password: hashedPassword,
      },
    });

    const roleId = createdRoles[userDef.role];
    if (!roleId) throw new Error(`Role ${userDef.role} tidak ditemukan saat seeding.`);

    await db.userRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId } },
      update: {},
      create: { userId: user.id, roleId },
    });

    console.log(`  - ${user.email} -> ${userDef.role}`);
  }

  console.log("\nSeeding selesai!");
  console.log("Akun demo:");
  console.log("  superadmin@test.com / Admin123!");
  console.log("  admin@test.com      / Admin123!");
  console.log("  user@test.com       / User123!");
}

if (import.meta.main) {
  seed()
    .catch((e) => {
      console.error("Seeding gagal:", e);
      process.exit(1);
    })
    .finally(async () => {
      await db.$disconnect();
    });
}
