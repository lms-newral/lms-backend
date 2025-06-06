import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { VerifyOtpDto } from './dto/otp.dto';
import { LoginDto } from './dto/login.dto';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup/request-otp')
  async requestSignupOtp(@Body() registerDto: RegisterDto) {
    return this.authService.requestSignupOtp(registerDto);
  }

  @Post('signup/verify-otp')
  async verifySignupOtp(
    @Body() verifyOtpDto: VerifyOtpDto,
    @Body() registerDto: RegisterDto,
  ) {
    return this.authService.verifySignupOtp(verifyOtpDto, registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
