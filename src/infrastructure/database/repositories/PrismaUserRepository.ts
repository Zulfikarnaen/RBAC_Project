import { db } from "../prisma-client";
import type { IUserRepository, UserWithRoles } from "../../../domain/repositories/IUserRepository";
import type { User } from "@prisma/client";

export class PrismaUserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return await db.user.findUnique({
      where: { email },
    });
  }

  // Method baru: cari user LENGKAP dengan relasi roles & permissions (untuk login)
  // Relasi bertingkat: User -> UserRole -> Role -> RolePermission -> Permission
  async findByEmailWithRoles(email: string): Promise<UserWithRoles | null> {
    return await db.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async create(data: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
    return await db.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: data.password,
      },
    });
  }
}