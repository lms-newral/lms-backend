import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserDto {
  name?: string;
  password?: string;
  profileImage?: string;
}
export class ChangeRole {
  role: Role;
}
enum Role {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  ADMIN = 'ADMIN',
}
export class checkPasswordDto {
  @IsNotEmpty()
  @IsString()
  password: string;
}
