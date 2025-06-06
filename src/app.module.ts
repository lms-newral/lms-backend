import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { ClientModule } from './client/client.module';
@Module({
  imports: [ClientModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
