import { Module } from '@nestjs/common';
import { QuoteController } from './quotes.controller';
import { QuoteService } from './quotes.service';
import { PrismaService } from '../prisma/prisma.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../auth/constants';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1h' }, // กำหนดเวลาให้ token หมดอายุใน 1 ชั่วโมง
    }),
  ],
  controllers: [QuoteController],
  providers: [QuoteService, PrismaService],
})
export class QuotesModule {}
