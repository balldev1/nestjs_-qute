import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { QuotesModule } from './quotes/quotes.module';
import { SearchModule } from './search/search.module';

@Module({
  imports: [AuthModule, QuotesModule, SearchModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
