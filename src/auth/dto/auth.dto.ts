import { IsEmail, IsNotEmpty, IsString, Min } from 'class-validator';

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

  @IsEmail()
  email: string;

  @IsString()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @Min(5)
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
