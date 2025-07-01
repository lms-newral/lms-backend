import { Module } from '@nestjs/common';
import { MailerService, OtpService } from './services.service';

@Module({
  providers: [MailerService, OtpService],
  exports: [MailerService, OtpService],
})
export class ServicesModule {}
