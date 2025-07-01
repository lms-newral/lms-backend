import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import {
  AccessTokenStrategy,
  RefreshTokenStrategy,
} from './strategies/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { MailerService, OtpService } from 'src/services/services.service';

@Module({
  imports: [JwtModule.register({})],
  providers: [
    AuthService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    MailerService,
    OtpService,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
