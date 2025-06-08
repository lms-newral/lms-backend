import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { AuthController } from './auth.controller';
import {
  Access_token_strategy,
  Refresh_token_strategy,
} from './strategies/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { MailerService, OtpService } from 'src/services/services.service';

@Module({
  imports: [UsersModule, JwtModule.register({})],
  providers: [
    AuthService,
    Access_token_strategy,
    Refresh_token_strategy,
    MailerService,
    OtpService,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
