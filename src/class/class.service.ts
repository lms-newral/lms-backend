import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { createClassDto, updateClassDto } from './dto/class.dto';
import { Role, User, Course, Class } from '@prisma/client';

type UserWithRole = Pick<User, 'role'>;
type CourseWithCreator = Pick<Course, 'creatorId'>;
type ClassWithCreator = Pick<Class, 'creatorId'>;

@Injectable()
export class ClassService {
  constructor(private prisma: PrismaService) {}

  async createClass(dto: createClassDto, userId: string, courseId: string) {
    const [course, user] = await Promise.all([
      this.findCourseOrThrow(courseId),
      this.findUserOrThrow(userId),
    ]);

    this.validateCourseAccess(user, course.creatorId, userId);

    if (!dto.zoomLink && !dto.videoLink) {
      throw new ForbiddenException(
        'You need to pass either a zoomLink or a recorded videoLink',
      );
    }

    const newClass = await this.prisma.class.create({
      data: {
        title: dto.title,
        description: dto.description,
        videoLink: dto.videoLink,
        zoomLink: dto.zoomLink,
        courseId: courseId,
        creatorId: userId,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        isLive: dto.isLive,
        isRecorded: dto.isRecorded,
        isActive: dto.isActive,
      },
    });

    return { message: 'Class created successfully', data: newClass };
  }

  async getClassByClassId(classId: string) {
    const classes = await this.prisma.class.findUnique({
      where: { id: classId },
    });

    if (!classes) {
      throw new NotFoundException('No classes found for this course');
    }

    return classes;
  }

  async getClassesInCourse(courseId: string) {
    const classes = await this.prisma.class.findMany({
      where: { courseId },
    });

    if (!classes.length) {
      throw new NotFoundException('No classes found for this course');
    }

    return classes;
  }

  async updateClass(dto: updateClassDto, userId: string, classId: string) {
    const [existingClass, user] = await Promise.all([
      this.findClassOrThrow(classId),
      this.findUserOrThrow(userId),
    ]);

    this.validateClassAccess(user, existingClass.creatorId, userId);

    const { scheduledAt, ...rest } = dto;
    const updatedClass = await this.prisma.class.update({
      where: { id: classId },
      data: {
        ...rest,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      },
    });

    return updatedClass;
  }

  async deleteClass(classId: string, userId: string) {
    const [existingClass, user] = await Promise.all([
      this.findClassOrThrow(classId),
      this.findUserOrThrow(userId),
    ]);

    this.validateClassAccess(user, existingClass.creatorId, userId);

    await this.prisma.class.delete({
      where: { id: classId },
    });

    return { message: 'Class deleted successfully' };
  }

  // Private helper methods
  private async findUserOrThrow(userId: string): Promise<UserWithRole> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  private async findCourseOrThrow(
    courseId: string,
  ): Promise<CourseWithCreator> {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { creatorId: true },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  private async findClassOrThrow(classId: string): Promise<ClassWithCreator> {
    const classEntity = await this.prisma.class.findUnique({
      where: { id: classId },
      select: { creatorId: true },
    });

    if (!classEntity) {
      throw new NotFoundException('Class not found');
    }

    return classEntity;
  }

  private isAdminUser(user: UserWithRole): boolean {
    return user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN;
  }

  private validateCourseAccess(
    user: UserWithRole,
    courseCreatorId: string,
    userId: string,
  ): void {
    if (!this.isAdminUser(user) && courseCreatorId !== userId) {
      throw new UnauthorizedException(
        'You are not authorized to perform this action on this course',
      );
    }
  }

  private validateClassAccess(
    user: UserWithRole,
    classCreatorId: string,
    userId: string,
  ): void {
    if (!this.isAdminUser(user) && classCreatorId !== userId) {
      throw new UnauthorizedException(
        'You are not authorized to perform this action on this class',
      );
    }
  }
}
