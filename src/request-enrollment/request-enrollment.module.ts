import { Module } from '@nestjs/common';
import { RequestEnrollmentController } from './request-enrollment.controller';
import { RequestEnrollmentService } from './request-enrollment.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [RequestEnrollmentController],
  providers: [RequestEnrollmentService, JwtService, PrismaService],
})
export class RequestEnrollmentModule {}
