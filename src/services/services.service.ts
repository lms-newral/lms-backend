import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MailerService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST as string,
      port: parseInt(process.env.SMTP_PORT as string),
      secure: true,
      auth: {
        user: process.env.SMTP_USER as string,
        pass: process.env.SMTP_PASS as string,
      },
    });
  }

  async sendMail(options: {
    to: string;
    subject: string;
    text?: string;
    html?: string;
  }): Promise<nodemailer.SentMessageInfo> {
    return await this.transporter.sendMail({
      from: process.env.SMTP_FROM as string,
      ...options,
    });
  }
}

@Injectable()
export class OtpService {
  private readonly EXPIRY_MINUTES = 10;

  constructor(
    private readonly mailerService: MailerService,
    private readonly prismaService: PrismaService,
  ) {}

  async generateAndSendOtp(email: string, userId?: string): Promise<string> {
    const code = Math.floor(100000 + Math.random() * 900000).toString(); //generate a 6 digit code
    const expiresAt = new Date(Date.now() + this.EXPIRY_MINUTES * 60000);

    const otp = await this.prismaService.otp.create({
      data: {
        userId,
        expiresAt,
        email,
        otp: code,
      },
    });
    if (!otp) throw new Error('failed to create otp');
    const htmlContent = `<p>Your verification code is <b>${code}</b></p>`;

    if (process.env.NODE_ENV === 'production') {
      await this.mailerService.sendMail({
        to: email,
        subject: 'OTP Verification Code',
        html: htmlContent,
      });
    }

    console.log(`Your OTP is ${code}`);
    return code;
  }

  async verifyOtp(email: string, otpCode: string) {
    const otpRecord = await this.prismaService.otp.findFirst({
      where: {
        email,
        otp: otpCode,
        used: false,
      },
    });

    if (!otpRecord) {
      throw new Error('Invalid OTP');
    }

    if (otpRecord.expiresAt < new Date()) {
      throw new Error('OTP expired');
    }

    // Update the OTP record to mark it as used
    await this.prismaService.otp.update({
      where: {
        id: otpRecord.id,
      },
      data: {
        used: true,
      },
    });

    return otpRecord;
  }
}
