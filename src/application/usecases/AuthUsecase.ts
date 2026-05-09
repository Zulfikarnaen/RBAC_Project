// src/application/usecases/AuthUsecase.ts
import type { IUserRepository } from "../../domain/repositories/IUserRepository";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "rahasia_enterprise_default";

export class AuthUsecase {
  constructor(private userRepository: IUserRepository) {}

  async register(data: any) {
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

  async login(data: any) {
    const { email, password } = data;

    // 1. Identifikasi pengguna
    const user = await this.userRepository.findByEmail(email);
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
      { expiresIn: "1d" } // Durasi kedaluwarsa token standar enterprise
    );

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    };
  }
}