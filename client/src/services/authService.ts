import api from "./api";
import type { ApiResponse, LoginResponseData } from "@/types/api.types";

export interface LoginPayload {
  email: string;
  password: string;
}

export const authService = {
  login: async (payload: LoginPayload) => {
    const res = await api.post<ApiResponse<LoginResponseData>>("/auth/login", payload);
    return res.data;
  },

  register: async (payload: { username: string; email: string; password: string }) => {
    const res = await api.post<ApiResponse<LoginResponseData>>("/auth/register", payload);
    return res.data;
  },
};