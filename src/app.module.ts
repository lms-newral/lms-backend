import { Module } from '@nestjs/common';

import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ClientController } from './client/client.controller';
import { ClientService } from './client/client.service';
import { ClientModule } from './client/client.module';
import { ServicesModule } from './services/services.module';

@Module({
  imports: [AuthModule, PrismaModule, ClientModule, ServicesModule],
  controllers: [ClientController],
  providers: [ClientService],
})
export class AppModule {}
