import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/authService";
import type { Role, Permission, User } from "@/types/auth.types";

export function useAuth() {
  const { user, token, isAuthenticated, login, logout } = useAuthStore();

  const handleLogin = async (email: string, password: string) => {
    const res = await authService.login({ email, password });
    
    if (res.success && res.data) {
      // PROSES DATA USER AGAR AMAN
      const userData = res.data.user;

      const user: User = {
        id: userData.id,
        username: userData.username || userData.email.split('@')[0], // Fallback nama dari email
        email: userData.email,
        // PERBAIKAN DISINI: Mapping data role agar jadi string/format yang benar
        roles: (userData.roles || []).map((r: any) => {
          if (typeof r === 'string') return r;
          // Jika r adalah object relasi dari Prisma (UserRole -> Role)
          return r.role?.name || r.name || "USER";
        }) as Role[],
        // Sama dengan permission, pastikan ambil nama/slugnya saja
        permissions: (userData.permissions || []).map((p: any) => {
          return typeof p === 'string' ? p : (p.permission?.name || p.name || p.slug);
        }) as Permission[],
      };

      login(user, res.data.token);
      return user;
    }
    throw new Error(res.message ?? "Login gagal");
  };

  const handleLogout = () => logout();

  return { user, token, isAuthenticated, handleLogin, handleLogout };
}