import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class loginDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}

export class signupDto {
  @IsNotEmpty()
  @IsString()
  code: string;

  email: string;
  phoneNumber?: string;
  username: string;
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  profileImage?: string;
  isVerified?: boolean;

  role?: Role;
  deviceLimit: number;
  devices: Device[];
}
enum Role {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}
class Device {
  deviceId: string;
  refreshToken: string;
}

export class checkUserDto {
  email: string;
}
export class requestOtpDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
export class logoutDto {
  userId?: string;
  deviceId?: string;
}
export class refreshTokenDto {
  refreshToken: string;
}
