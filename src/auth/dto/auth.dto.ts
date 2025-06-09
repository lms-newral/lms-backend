import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class loginDto {
  @IsNotEmpty()
  @IsString()
  clientId: string;

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

  @IsString()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  profileImage: string;

  @IsString()
  clientId: string;

  isVerified: boolean;
  role: Role;
  deviceLimit: number;
  devices: Device[];
}
enum Role {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  ADMIN = 'ADMIN',
}
class Device {
  deviceId: string;
  refreshToken: string;
}

export class checkUserDto {
  email: string;
  clientId: string;
}
export class requestOtpDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
export class logoutDto {
  userId: string;
  deviceId: string;
}
