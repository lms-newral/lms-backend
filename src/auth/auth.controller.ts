import { Body, Controller, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { loginDto, signupDto } from './dto/auth.dto';
import { Tokens } from './types';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/request-otp')
  requestOtp(@Req() req: Request): Promise<string> {
    return this.authService.requestOtp(req);
  }
  @Post('/signup')
  signup(@Body() dto: signupDto, @Req() req: Request): Promise<Tokens | null> {
    return this.authService.signup(dto, req);
  }
  @Post('/login')
  login(@Body() dto: loginDto, @Req() req: Request): Promise<any> {
    return this.authService.login(dto, req);
  }
  @Post('/logout')
  logout() {
    this.authService.logout();
  }
  @Post('/refresh')
  refershTokens() {
    this.authService.refreshTokens();
  }
}
