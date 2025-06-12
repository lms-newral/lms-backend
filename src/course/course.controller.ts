import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CreateCoureDto, UpdateCourseDto } from './dto/course.dto';
import { CourseService } from './course.service';
import { Roles } from 'src/common/decorators';
import { Course, Role } from '@prisma/client';
import { JwtAuthGuard } from 'src/common/guards';
import { RequestWithUser } from 'src/common/guards/auth.guard';

@Controller('course')
export class CourseController {
  constructor(private couseService: CourseService) {}
  @Get()
  getCourses(): Promise<Course[] | null> {
    return this.couseService.getCourses();
  }
  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles(Role.TEACHER || Role.ADMIN || Role.SUPER_ADMIN)
  createCourse(@Body() dto: CreateCoureDto, @Request() req: RequestWithUser) {
    return this.couseService.createCourse(dto, req.user.id);
  }

  @Put(':courseId')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.TEACHER || Role.ADMIN || Role.SUPER_ADMIN)
  updateCourse(
    @Param('courseId') courseId: string,
    @Body() dto: UpdateCourseDto,
    @Request() req: RequestWithUser,
  ) {
    return this.couseService.updateCourse(courseId, dto, req.user.id);
  }
}
