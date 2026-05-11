import { db } from "../prisma-client";
import type { IUserRepository } from "../../../domain/repositories/IUserRepository";
import type { User } from "@prisma/client";

export class PrismaUserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return await db.user.findUnique({
      where: { email },
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