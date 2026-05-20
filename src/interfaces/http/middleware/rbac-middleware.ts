import jwt from "jsonwebtoken";
import type { Context } from "elysia";
import { CheckPermission } from "../../../application/use-cases/check-permission";
import { JWT_SECRET } from "../../../shared/config/auth";

const checkPermission = new CheckPermission();
type RbacContext = Pick<Context, "headers" | "set" | "store">;

function getUserIdFromToken(token: string): string | null {
  const payload = jwt.verify(token, JWT_SECRET);

  if (typeof payload === "string") return null;
  return typeof payload.userId === "string" ? payload.userId : null;
}

export function rbacGuard(requiredPermission: string) {
  return async ({ headers, set, store }: RbacContext) => {
    // 1. Ambil token dari Authorization header
    const authHeader = headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      set.status = 401;
      return { success: false, message: "Token tidak ditemukan." };
    }

    const token = authHeader.slice("Bearer ".length).trim();
    if (!token) {
      set.status = 401;
      return { success: false, message: "Token tidak ditemukan." };
    }

    // 2. Verifikasi JWT
    let userId: string;
    try {
      const verifiedUserId = getUserIdFromToken(token);
      if (!verifiedUserId) {
        set.status = 401;
        return { success: false, message: "Token tidak valid atau kadaluarsa." };
      }
      userId = verifiedUserId;
    } catch {
      set.status = 401;
      return { success: false, message: "Token tidak valid atau kadaluarsa." };
    }

    // 3. Simpan userId di store agar controller bisa menggunakannya
    (store as Record<string, unknown>).userId = userId;

    // 4. Cek permission user
    const allowed = await checkPermission.execute(userId, requiredPermission);
    if (!allowed) {
      set.status = 403;
      return {
        success: false,
        message: `Akses ditolak. Membutuhkan permission: ${requiredPermission}`,
      };
    }
  };
}
