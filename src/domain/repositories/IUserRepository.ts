// src/domain/repositories/IUserRepository.ts
import type { User } from "@prisma/client";

// Tipe untuk User lengkap beserta relasi roles dan permissions
// Digunakan sebagai return type dari findByEmailWithRoles
export type UserWithRoles = User & {
  roles: {
    role: {
      name: string;
      permissions: {
        permission: {
          name: string;
        };
      }[];
    };
  }[];
};

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;

  // Method baru: cari user beserta relasi roles & permissions (untuk login)
  findByEmailWithRoles(email: string): Promise<UserWithRoles | null>;

  create(data: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User>;
}