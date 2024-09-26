import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
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
  controllers: [SearchController],
  providers: [SearchService, PrismaService],
})
export class SearchModule {}
