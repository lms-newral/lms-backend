import { IsEmail, IsNotEmpty, IsString, IsOptional, IsEnum, MinLength } from "class-validator";
import { Role } from "@prisma/client";

export class RegisterDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEnum(Role)
    @IsOptional()
    role?: Role;
}