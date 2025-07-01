import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateCoureDto, UpdateCourseDto } from './dto/course.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Course, Role } from '@prisma/client';

@Injectable()
export class CourseService {
  constructor(private prisma: PrismaService) {}

  async createCourse(dto: CreateCoureDto, userId: string) {
    try {
      const course = await this.prisma.course.create({
        data: {
          title: dto.title,
          description: dto.description,
          thumbnail: dto.thumbnail,
          price: dto.price,
          category: dto.category,
          creatorId: userId,
        },
      });
      return course;
    } catch (error) {
      throw new Error(error);
    }
  }
  async getCourses(): Promise<Course[] | null> {
    try {
      return await this.prisma.course.findMany({});
    } catch (error) {
      throw new Error(error);
    }
  }

  async updateCourse(
    courseId: string,
    dto: UpdateCourseDto,
    userId: string, // This will come from the guard
  ) {
    // Find the course
    const course = await this.prisma.course.findUnique({
      where: {
        id: courseId,
      },
    });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Check if user is the creator of the course
    if (userId !== course.creatorId) {
      throw new UnauthorizedException(
        'You can only update courses you created',
      );
    }

    const updatedCourse = await this.prisma.course.update({
      where: {
        id: courseId,
      },
      data: dto,
    });

    return updatedCourse;
  }
  async getCourseById(courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    return course;
  }
  async transferOwnership(courseId: string, dto: { teacherId: string }) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: dto.teacherId,
      },
      select: {
        role: true,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.role !== Role.TEACHER) {
      throw new ForbiddenException('User is not a teacher');
    }
    const course = await this.prisma.course.findUnique({
      where: {
        id: courseId,
      },
      select: {
        creatorId: true,
      },
    });
    if (!course) {
      throw new NotFoundException('course not found');
    }
    if (course.creatorId === dto.teacherId) {
      throw new ForbiddenException('Cant perform this action');
    }
    const updatedCourse = await this.prisma.course.update({
      where: {
        id: courseId,
      },
      data: {
        creatorId: dto.teacherId,
      },
    });
    return updatedCourse;
  }
}
