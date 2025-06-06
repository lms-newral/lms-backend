import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private transporter;

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

  async sendMail(options: { to: string; subject: string; text: string }) {
    return this.transporter.sendMail({
      from: process.env.SMTP_FROM as string,
      ...options,
    });
  }
} 