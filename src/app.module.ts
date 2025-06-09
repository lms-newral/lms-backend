import { Module } from '@nestjs/common';

import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ClientController } from './client/client.controller';
import { ClientService } from './client/client.service';
import { ClientModule } from './client/client.module';
import { ServicesModule } from './services/services.module';
import { UserService } from './user/user.service';
import { UserController } from './user/user.controller';
import { UserModule } from './user/user.module';

@Module({
  imports: [AuthModule, PrismaModule, ClientModule, ServicesModule, UserModule],
  controllers: [ClientController, UserController],
  providers: [ClientService, UserService],
})
export class AppModule {}
