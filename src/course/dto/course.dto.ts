import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCoureDto {
  @IsString()
  @IsNotEmpty()
  title: string;
  @IsString()
  @IsNotEmpty()
  description: string;

  thumbnail?: string;
  price?: number;
  category?: string;
}

export class UpdateCourseDto {
  title?: string;
  description?: string;
  thumbnail?: string;
  price?: number;
  category?: string;
  isActice?: boolean;
}
