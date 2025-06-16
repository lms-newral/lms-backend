import { Module } from '@nestjs/common';
import { CourseEnrollmentService } from './course-enrollment.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CourseEnrollmentController } from './course-enrollment.controller';

@Module({
  controllers: [CourseEnrollmentController],
  providers: [CourseEnrollmentService, PrismaService],
})
export class CourseEnrollmentModule {}
