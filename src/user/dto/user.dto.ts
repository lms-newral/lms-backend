import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserDto {
  name?: string;
  password?: string;
  profileImage?: string;
}
export class checkPasswordDto {
  @IsNotEmpty()
  @IsString()
  password: string;
}
