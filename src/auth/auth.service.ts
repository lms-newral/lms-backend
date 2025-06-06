import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { hash } from 'bcrypt';
import { MailerService } from '../mailer.service';
import { OtpService } from '../otp.service';
import { VerifyOtpDto } from './dto/otp.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailerService: MailerService,
    private readonly otpService: OtpService,
  ) {}

  public async requestSignupOtp(registerDto: RegisterDto) {
    const otp = this.otpService.generateOtp();
    await this.otpService.saveOtp(registerDto.email, otp);
    await this.mailerService.sendMail({
      to: registerDto.email,
      subject: 'Your Signup OTP',
      text: `Your OTP is: ${otp}`,
    });
    return { message: 'OTP sent to email' };
  }

  public async verifySignupOtp(
    verifyOtpDto: VerifyOtpDto,
    registerDto: RegisterDto,
  ) {
    const isValid = await this.otpService.verifyOtp(
      verifyOtpDto.email,
      verifyOtpDto.otp,
    );
    if (!isValid) throw new BadRequestException('Invalid OTP');
    const hashedPassword = await hash(registerDto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        name: registerDto.name,
        role: registerDto.role,
      },
    });
    await this.otpService.deleteOtp(verifyOtpDto.email);
    return user;
  }

  public async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });
  }
}
