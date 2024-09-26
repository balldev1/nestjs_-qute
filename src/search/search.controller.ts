import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SearchService, UserBasicInfo } from './search.service';
import { Quote } from './search.service';
import { AuthGuard } from '../auth/auth.guard';
import { User } from '@prisma/client';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @UseGuards(AuthGuard)
  @Get('quotes')
  async searchQuotes(
    @Query('term') term: string,
    @Query('userId') userId: string | null,
    @Query('votes') votes: string | null,
    @Query('createdById') createdById: string | null,
    @Query('page') page: string, // รับ page จาก query
    @Query('limit') limit: string, // รับ limit จาก query
  ): Promise<{ quotes: Quote[]; total: number }> {
    const voteValue =
      votes === 'true' ? true : votes === 'false' ? false : null;

    // ส่ง page และ limit ไปที่ service (แปลงจาก string เป็น number)
    return this.searchService.searchQuotes(
      term,
      userId,
      voteValue,
      createdById,
      parseInt(page, 10) || 1,
      parseInt(limit, 10) || 5,
    );
  }

  @UseGuards(AuthGuard)
  @Get('users')
  async getAllUsers(): Promise<UserBasicInfo[]> {
    return this.searchService.getAllUsers();
  }
}
