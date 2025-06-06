import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { ClientModule } from './client/client.module';

@Module({
  imports: [ClientModule],
  providers: [PrismaService],
})
export class AppModule { }
