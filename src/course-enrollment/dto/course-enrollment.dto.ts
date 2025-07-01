import { IsNotEmpty, IsString } from 'class-validator';

export class courseEnrollmentDto {
  @IsNotEmpty()
  @IsString()
  courseId: string;
  @IsNotEmpty()
  @IsString()
  studentId: string;
}
export class updateCourseEnrollmentDto {
  @IsNotEmpty()
  @IsString()
  courseId: string;
  @IsNotEmpty()
  @IsString()
  studentId: string;

  completedAt?: number;
  progress?: number;
  lastAccessedAt?: number;
}
