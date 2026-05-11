import jwt from "jsonwebtoken";
import { CheckPermission } from "../../application/usecases/CheckPermission";

const JWT_SECRET = process.env.JWT_SECRET || "rahasia_enterprise_default";
const checkPermission = new CheckPermission();

export function rbacGuard(requiredPermission: string) {
  return async ({ headers, set, store }: {
    headers: Record<string, string | undefined>;
    set: { status: number };
    store: Record<string, unknown>;
  }) => {
    // 1. Ambil token dari Authorization header
    const authHeader = headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      set.status = 401;
      return { success: false, message: "Token tidak ditemukan." };
    }

    const token = authHeader.split(" ")[1];

    // 2. Verifikasi JWT
    let userId: string;
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
      userId = payload.userId;
    } catch {
      set.status = 401;
      return { success: false, message: "Token tidak valid atau kadaluarsa." };
    }

    // 3. Simpan userId di store agar controller bisa menggunakannya
    store.userId = userId;

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
