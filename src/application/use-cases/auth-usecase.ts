// src/application/use-cases/auth-usecase.ts
import type { IUserRepository, UserWithRoles } from "../../domain/repositories/user-repository";
import jwt from "jsonwebtoken";
import { JWT_EXPIRES_IN, JWT_SECRET } from "../../shared/config/auth";
import { ROLE_PRIORITY } from "../../shared/constants/rbac";

type RegisterPayload = {
  username: string;
  email: string;
  password: string;
};

type LoginPayload = Pick<RegisterPayload, "email" | "password">;

function getOrderedRoleNames(user: UserWithRoles): string[] {
  const userRoleNames = new Set(user.roles.map((userRole) => userRole.role.name));

  return [
    ...ROLE_PRIORITY.filter((role) => userRoleNames.has(role)),
    ...Array.from(userRoleNames).filter((role) => !ROLE_PRIORITY.includes(role)),
  ];
}

function getUniquePermissionNames(user: UserWithRoles): string[] {
  return Array.from(
    new Set(
      user.roles.flatMap((userRole) =>
        userRole.role.permissions.map((rolePermission) => rolePermission.permission.name)
      )
    )
  );
}

export class AuthUsecase {
  constructor(private userRepository: IUserRepository) {}

  async register(data: RegisterPayload) {
    const { username, email, password } = data;

    // 1. Validasi eksistensi pengguna
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error("Email sudah terdaftar di sistem.");
    }

    // 2. Kriptografi Hashing Password menggunakan API bawaan Bun
    const hashedPassword = await Bun.password.hash(password, {
      algorithm: "bcrypt",
      cost: 10,
    });

    // 3. Persistensi ke database
    const newUser = await this.userRepository.create({
      username,
      email,
      password: hashedPassword,
    });

    return {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
    };
  }

  async login(data: LoginPayload) {
    const { email, password } = data;

    // 1. Identifikasi pengguna dengan Role & Permission (Menggunakan method baru)
    const user = await this.userRepository.findByEmailWithRoles(email);
    if (!user) {
      throw new Error("Kredensial tidak valid.");
    }

    // 2. Verifikasi hash
    const isPasswordValid = await Bun.password.verify(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Kredensial tidak valid.");
    }

    // 3. Generasi JSON Web Token (JWT)
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN } // Durasi kedaluwarsa token standar enterprise
    );

    // 4. Ekstrak & Flatten data Roles dan Permissions dari database Prisma
    // Karena relasinya bertingkat (User -> UserRole -> Role -> RolePermission -> Permission), 
    // kita petakan (map) nilainya menjadi array string/object yang bersih untuk Frontend.
    const roles = getOrderedRoleNames(user);
    const permissions = getUniquePermissionNames(user);

    // 5. Kembalikan response lengkap sesuai kebutuhan frontend
    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        roles,        
        permissions,  
      },
    };
  }
}
