import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface Quote {
  id: string;
  content: string;
  createdById: string;
  createdByEmail?: string; // เพิ่มฟิลด์สำหรับเก็บอีเมลของผู้สร้าง
  voted: boolean; // เพิ่มฟิลด์สำหรับบอกว่าโหวตแล้วหรือยัง
}

export interface UserBasicInfo {
  id: string;
  email: string;
}

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async getAllUsers(): Promise<UserBasicInfo[]> {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
      },
    });
  }

  async searchQuotes(
    searchTerm: string | null,
    userId: string | null,
    vote: boolean | null,
    createdById: string | null,
    page: number, // รับ page
    limit: number, // รับ limit
  ): Promise<{ quotes: Quote[]; total: number }> {
    const where: any = {};

    // Filter by searchTerm
    if (searchTerm) {
      where.content = {
        contains: searchTerm,
        mode: 'insensitive',
      };
    }

    // Filter by userId
    if (userId) {
      where.createdById = userId;
    }

    // Filter by createdById
    if (createdById) {
      where.createdById = createdById;
    }

    // Filter by vote
    if (vote !== null) {
      const votes = await this.prisma.vote.findMany({
        where: {
          ...(vote ? { userId } : { NOT: { userId } }),
        },
      });
      const quoteIds = votes.map((vote) => vote.quoteId);
      where.id = vote ? { in: quoteIds } : { not: { in: quoteIds } };
    }

    // นับจำนวนข้อมูลทั้งหมดที่ตรงกับเงื่อนไข
    const total = await this.prisma.quote.count({ where });

    // ดึงข้อมูลโดยใช้ skip และ take
    const quotes = await this.prisma.quote.findMany({
      where,
      take: limit, // ดึงข้อมูลตามจำนวน limit
      skip: (page - 1) * limit, // ข้ามข้อมูลตามหน้า
      select: {
        id: true,
        content: true,
        createdById: true,
      },
    });

    // รวบรวมข้อมูลอีเมลของผู้สร้างคำคมและตรวจสอบว่าโหวตแล้วหรือยัง
    const quotesWithVotes = await Promise.all(
      quotes.map(async (quote) => {
        const user = await this.prisma.user.findUnique({
          where: { id: quote.createdById },
          select: { email: true },
        });
        const voteExists = await this.prisma.vote.findFirst({
          where: { quoteId: quote.id },
        });
        return {
          ...quote,
          createdByEmail: user ? user.email : null,
          voted: !!voteExists,
        };
      }),
    );

    return {
      quotes: quotesWithVotes,
      total, // ส่งจำนวนข้อมูลทั้งหมดกลับไปด้วย
    };
  }
}
