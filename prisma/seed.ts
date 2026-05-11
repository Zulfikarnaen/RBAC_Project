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

async function main() {
  console.log("🌱 Memulai seeding data RBAC...\n");

  console.log("📋 Menyiapkan permissions...");
  const createdPermissions: Record<string, string> = {};

  for (const perm of PERMISSIONS) {
    const result = await db.permission.upsert({
      where: { name: perm.name },
      update: { description: perm.description },
      create: perm,
    });
    createdPermissions[result.name] = result.id;
    console.log(`  ✓ ${result.name}`);
  }

  console.log("\n👥 Menyiapkan roles dan mengassign permissions...");

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

    console.log(`  ✓ ${role.name} — ${roleDef.permissions.length} permissions`);
  }

  console.log("\n✅ Seeding selesai!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding gagal:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
