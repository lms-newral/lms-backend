import { Module } from '@nestjs/common';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [CourseController],
  providers: [CourseService, JwtService],
})
export class CourseModule {}
