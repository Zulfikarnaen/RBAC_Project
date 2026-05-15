import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/authService";
import type { Role, Permission, User } from "@/types/auth.types";

export function useAuth() {
  const { user, token, isAuthenticated, login, logout } = useAuthStore();

  const handleLogin = async (email: string, password: string) => {
    const res = await authService.login({ email, password });
    if (res.success && res.data) {
      const user: User = {
        id: res.data.user.id,
        username: res.data.user.username,
        email: res.data.user.email,
        roles: res.data.user.roles as Role[],
        permissions: res.data.user.permissions as Permission[],
      };
      login(user, res.data.token);
      return user;
    }
    throw new Error(res.message ?? "Login gagal");
  };

  const handleLogout = () => logout();

  return { user, token, isAuthenticated, handleLogin, handleLogout };
}