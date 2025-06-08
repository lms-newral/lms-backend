import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

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
    text: string;
  }): Promise<nodemailer.SentMessageInfo> {
    return await this.transporter.sendMail({
      from: process.env.SMTP_FROM as string,
      ...options,
    });
  }
}

@Injectable()
export class OtpService {
  private otpStore = new Map<string, string>();

  constructor(private readonly mailerService: MailerService) {}

  async generateOtp(email: string): Promise<string> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    this.saveOtp(email, code);
    const text = `<p> Your verification code is <b>${code}</b>`;
    if (process.env.ENV === 'PROD') {
      await this.mailerService.sendMail({
        to: email,
        subject: 'OTP code',
        text: text,
      });
    }
    console.log(`Your otp is ${code}`);
    return code;
  }
  sendOtp() {}
  saveOtp(email: string, otp: string) {
    this.otpStore.set(email, otp);
  }

  verifyOtp(email: string, otp: string): boolean {
    return this.otpStore.get(email) === otp;
  }

  deleteOtp(email: string) {
    this.otpStore.delete(email);
  }
}
