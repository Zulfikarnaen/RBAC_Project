// src/store/authStore.ts
import { create } from "zustand";
import type { User, AuthState } from "@/types/auth.types";

interface AuthActions {
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>((set) => {
  // Fungsi helper untuk mengambil user dengan aman saat pertama kali app dimuat (refresh)
  const getInitialUser = (): User | null => {
    try {
      const savedUser = localStorage.getItem("user");
      if (!savedUser) return null;
      return JSON.parse(savedUser);
    } catch (error) {
      console.error("Gagal parse data user dari localStorage:", error);
      localStorage.removeItem("user"); // Bersihkan jika datanya korup/rusak
      return null;
    }
  };

  const savedToken = localStorage.getItem("token");

  return {
    user: getInitialUser(),
    token: savedToken,
    isAuthenticated: !!savedToken,

    login: (user, token) => {
      try {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user)); // Menyimpan objek user utuh (termasuk roles & permissions)
        set({ user, token, isAuthenticated: true });
      } catch (error) {
        console.error("Gagal menyimpan data login:", error);
      }
    },

    logout: () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      set({ user: null, token: null, isAuthenticated: false });
    },
  };
});