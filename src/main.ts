import { db } from "./infrastructure/database/prisma-client";

async function testConnection() {
  try {
    const newRole = await db.role.create({
      data: {
        name: "SUPERADMIN",
        description: "Administrator tertinggi dengan akses penuh",
      },
    });

    console.log("✅ Berhasil masuk database:", newRole);
  } catch (error) {
    console.error("❌ Gagal koneksi database:", error);
  } finally {
    await db.$disconnect();
  }
}

testConnection();