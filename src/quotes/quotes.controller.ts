import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { QuoteService } from './quotes.service';

@Controller('quotes')
export class QuoteController {
  constructor(private quoteService: QuoteService) {}

  @UseGuards(AuthGuard)
  @Post()
  createQuote(
    @Request() req, // ดึง request object
    @Body('content') content: string, // รับเฉพาะ content ผ่าน Body
  ) {
    const userId = req.user.sub; // ดึง userId จาก JWT token (sub)
    return this.quoteService.createQuote(userId, content); // ส่ง userId และ content ไปยัง service
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  updateQuote(
    @Param('id') id: string,
    @Request() req,
    @Body('content') content: string,
  ) {
    return this.quoteService.updateQuote(id, req.user.userId, content);
  }

  @UseGuards(AuthGuard)
  @Get()
  getQuotes() {
    return this.quoteService.getQuotes();
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  deleteQuote(@Param('id') id: string) {
    return this.quoteService.deleteQuote(id);
  }

  @UseGuards(AuthGuard)
  @Get('votes')
  async getVotes(@Request() req) {
    const userId = req.user.sub;
    return this.quoteService.getVotesByUserId(userId);
  }

  @UseGuards(AuthGuard)
  @Post(':quoteId/vote')
  voteQuote(@Param('quoteId') quoteId: string, @Request() req) {
    // req.user.sub คือ userId ที่ได้จาก JWT payload
    return this.quoteService.voteQuote(req.user.sub, quoteId);
  }

  @UseGuards(AuthGuard)
  @Delete('/vote/delete')
  async deleteAllVotesForUser(@Request() req) {
    // ดึง userId จาก JWT
    const userId = req.user.sub;

    // เรียกใช้ service เพื่อลบโหวตทั้งหมดของผู้ใช้
    return this.quoteService.deleteVotesByUserId(userId);
  }
}
