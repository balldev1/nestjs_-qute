import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface Vote {
  id: string;
  quoteId: string;
  userId: string;
  createdAt: Date;
}

interface Quote {
  id: string;
  content: string;
  createdById: string;
  votes: Vote[];
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class QuoteService {
  constructor(private prisma: PrismaService) {}

  // สร้างคำคม
  async createQuote(userId: string, content: string) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const existingQuote = await this.prisma.quote.findFirst({
      where: { content: content },
    });

    if (existingQuote) {
      throw new Error('Quote with this content already exists');
    }

    return this.prisma.quote.create({
      data: {
        content: content,
        createdBy: {
          connect: { id: userId }, // เชื่อมต่อกับผู้ใช้ที่มีอยู่
        },
      },
    });
  }
  // แก้ไขคำคม (แก้ได้เฉพาะเมื่อยังไม่มีโหวต)
  async updateQuote(quoteId: string, userId: string, content: string) {
    const quote: Quote = await this.prisma.quote.findUnique({
      where: { id: quoteId },
      select: {
        id: true,
        content: true,
        createdById: true,
        createdAt: true,
        updatedAt: true,
        votes: true,
      },
    });

    if (!quote) throw new NotFoundException('Quote not found');
    if (quote.votes.length > 0) {
      throw new BadRequestException('Cannot edit quote with existing votes');
    }

    return this.prisma.quote.update({
      where: { id: quoteId },
      data: { content },
    });
  }

  // ดูคำคม
  async getQuotes() {
    return this.prisma.quote.findMany();
  }

  // ลบคำคม (ลบได้เฉพาะเมื่อยังไม่มีโหวต)
  async deleteQuote(quoteId: string) {
    const quote: Quote = await this.prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        votes: true, // ใช้ include เพื่อดึงข้อมูล votes
      },
    });

    if (!quote) throw new NotFoundException('Quote not found');
    if (quote.votes.length > 0) {
      throw new BadRequestException('Cannot delete quote with existing votes');
    }

    return this.prisma.quote.delete({ where: { id: quoteId } });
  }

  // ดูคำคม
  async getVotesByUserId(userId: string) {
    return this.prisma.vote.findMany({
      where: {
        userId: userId, // ค้นหาเฉพาะโหวตที่ตรงกับ userId
      },
    });
  }
  // โหวตคำคม (โหวตได้เมื่อยังไม่มีโหวต และผู้ใช้โหวตได้ครั้งเดียว)
  async voteQuote(userId: string, quoteId: string) {
    // ตรวจสอบว่าผู้ใช้ได้โหวตคำคมนี้แล้วหรือยัง
    const existingVote = await this.prisma.vote.findFirst({
      where: { userId, quoteId }, // ตรวจสอบทั้ง userId และ quoteId
    });

    if (existingVote) {
      throw new BadRequestException('You have already voted for this quote');
    }

    // ตรวจสอบว่าคำคมมีอยู่หรือไม่
    const quote = await this.prisma.quote.findUnique({
      where: { id: quoteId },
    });

    if (!quote) throw new NotFoundException('Quote not found');

    // สร้างโหวตใหม่
    const vote = await this.prisma.vote.create({
      data: {
        userId: userId,
        quoteId: quoteId,
      },
    });

    return vote;
  }

  async deleteVotesByUserId(userId: string) {
    // ค้นหาโหวตทั้งหมดที่มี userId ตรงกัน
    const votes = await this.prisma.vote.findMany({
      where: {
        userId,
      },
    });

    if (votes.length === 0) {
      throw new BadRequestException('No votes found for this user');
    }

    // ลบโหวตทั้งหมดที่เจอ
    await this.prisma.vote.deleteMany({
      where: {
        userId,
      },
    });

    return {
      message: 'All votes for the user have been deleted successfully',
    };
  }
}
