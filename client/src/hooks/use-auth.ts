import { useAuthStore } from "@/store/auth-store";
import { authService } from "@/services/auth-service";
import { normalizePermissions, normalizeRoles } from "@/utils/auth-role";
import type { User } from "@/types/auth.types";

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
        roles: normalizeRoles(userData.roles),
        permissions: normalizePermissions(userData.permissions),
      };

      login(user, res.data.token);
      return user;
    }
    throw new Error(res.message ?? "Login gagal");
  };

  const handleLogout = () => logout();

  return { user, token, isAuthenticated, handleLogin, handleLogout };
}
