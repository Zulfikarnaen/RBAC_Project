export type Role = "SUPERADMIN" | "ADMIN" | "EDITOR" | "MANAGER" | "USER";

export type Permission =
  | "READ_ROLE" | "CREATE_ROLE" | "UPDATE_ROLE" | "DELETE_ROLE"
  | "READ_USER" | "CREATE_USER" | "UPDATE_USER" | "DELETE_USER"
  | "READ_PERMISSION" | "CREATE_PERMISSION" | "UPDATE_PERMISSION" | "DELETE_PERMISSION"
  | "ASSIGN_ROLE" | "ASSIGN_PERMISSION"
  | "PUBLISH_ARTICLE" | "MANAGER";

export interface User {
  id: string;
  username: string;
  email: string;
  roles: Role[];
  permissions: Permission[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}