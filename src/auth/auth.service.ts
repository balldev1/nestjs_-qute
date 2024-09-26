// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // ฟังก์ชันการสมัครสมาชิก
  async register(email: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10); // เข้ารหัส password
    const user = await this.prisma.user.create({
      data: {
        email: email, // ส่งค่า email ที่แท้จริงที่รับมาจาก body
        password: hashedPassword, // ส่ง password ที่ถูกเข้ารหัสแล้ว
      },
    });
    return user;
  }

  // ฟังก์ชันการล็อกอิน
  async login(email: string, password: string) {
    const user: any = await this.prisma.user.findUnique({ where: { email } });
    if (user && (await bcrypt.compare(password, user.password))) {
      const payload = { email: user.email, sub: user.id };
      return {
        access_token: this.jwtService.sign(payload),
      };
    }
    throw new Error('Invalid credentials');
  }
}
