export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface LoginResponseData {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    roles: string[];
    permissions: string[];
  };
}