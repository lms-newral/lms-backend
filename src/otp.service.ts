import { Injectable } from '@nestjs/common';

@Injectable()
export class OtpService {
  private otpStore = new Map<string, string>();

  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async saveOtp(email: string, otp: string) {
    this.otpStore.set(email, otp);
  }

  async verifyOtp(email: string, otp: string): Promise<boolean> {
    return this.otpStore.get(email) === otp;
  }

  async deleteOtp(email: string) {
    this.otpStore.delete(email);
  }
} 