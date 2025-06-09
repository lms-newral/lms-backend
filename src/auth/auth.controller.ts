import { Body, Controller, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  checkUserDto,
  loginDto,
  logoutDto,
  requestOtpDto,
  signupDto,
} from './dto/auth.dto';
import { Tokens } from './types';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/request-otp')
  requestOtp(@Body() dto: requestOtpDto): Promise<string> {
    return this.authService.requestOtp(dto);
  }
  @Post('/check-email')
  checkEmail(@Body() dto: checkUserDto): Promise<boolean> {
    return this.authService.checkEmail(dto);
  }
  @Post('/signup-student')
  signup(@Body() dto: signupDto): Promise<Tokens | null> {
    return this.authService.signup(dto);
  }
  @Post('/signup-teacher')
  signupTeacher(@Body() dto: signupDto): Promise<Tokens | null> {
    return this.authService.signupTeacher(dto);
  }
  @Post('/login')
  login(@Body() dto: loginDto, @Req() req: Request): Promise<any> {
    return this.authService.login(dto, req);
  }
  @Post('/logout')
  logout(@Body() dto: logoutDto): Promise<string> {
    return this.authService.logout(dto);
  }
  @Post('/refresh')
  refershTokens(@Body() refreshToken: string): Promise<Tokens | null> {
    return this.authService.refreshTokens(refreshToken);
  }
}
