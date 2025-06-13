import { Module } from '@nestjs/common';
import { AssignmentController } from './assignment.controller';
import { AssignmentService } from './assignment.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
@Module({
  controllers: [AssignmentController],
  providers: [AssignmentService, JwtService, PrismaService],
})
export class AssignmentModule {}
