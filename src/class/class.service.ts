import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { createClassDto, updateClassDto } from './dto/class.dto';
import { Role } from '@prisma/client';

@Injectable()
export class ClassService {
  constructor(private prisma: PrismaService) {}
  async createClass(dto: createClassDto, userId: string, courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: {
        id: courseId,
      },
      select: {
        creatorId: true,
      },
    });
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        role: true,
      },
    });
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.role !== (Role.ADMIN || Role.SUPER_ADMIN)) {
      if (course.creatorId !== userId) {
        throw new UnauthorizedException(
          'You are not authorized to create this class ',
        );
      }
    }
    const createClass = await this.prisma.class.create({
      data: {
        title: dto.title,
        description: dto.description,
        videoLink: dto.videoLink,
        zoomLink: dto.videoLink,
        attachments: dto.attachments || '',
        courseId: courseId,
        creatorId: userId,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        isLive: dto.isLive,
        isRecorded: dto.isRecorded,
        isActive: dto.isActive,
      },
    });
    return { message: 'class is created', data: createClass };
  }
  async getClassesInCourse(courseId: string) {
    try {
      const classes = await this.prisma.class.findMany({
        where: {
          courseId,
        },
      });
      if (!classes || classes.length == 0) {
        throw new NotFoundException('classes not found');
      }
      return classes;
    } catch (error) {
      throw new InternalServerErrorException('something went wrong', error);
    }
  }
  async updateClass(dto: updateClassDto, userId: string, classId: string) {
    try {
      const getClass = await this.prisma.class.findUnique({
        where: {
          id: classId,
        },
        select: {
          creatorId: true,
        },
      });
      if (!getClass) {
        throw new NotFoundException('Class not found');
      }
      const user = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          role: true,
        },
      });
      if (!user) {
        throw new NotFoundException('user not found');
      }
      if (user.role !== (Role.ADMIN || Role.SUPER_ADMIN)) {
        if (getClass.creatorId !== userId) {
          throw new UnauthorizedException(
            'You are not authorized to update this class',
          );
        }
      }
      const { scheduledAt, ...rest } = dto;
      const updatedClass = await this.prisma.class.update({
        where: {
          id: classId,
        },
        data: {
          ...rest,
          scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        },
      });
      return updatedClass;
    } catch (e) {
      throw new ServiceUnavailableException('something is wrong' + e);
    }
  }

  async deleteClass(classId: string, userId: string) {
    try {
      const getClass = await this.prisma.class.findUnique({
        where: {
          id: classId,
        },
        select: {
          creatorId: true,
        },
      });
      if (!getClass) {
        throw new NotFoundException('class not found');
      }
      const user = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          role: true,
        },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      if (user.role !== (Role.ADMIN || Role.SUPER_ADMIN)) {
        if (userId !== getClass.creatorId)
          throw new UnauthorizedException(
            'You are not autorized to delete this class',
          );
      }
      await this.prisma.class.delete({
        where: {
          id: classId,
        },
      });
      return { message: 'Class deleted' };
    } catch (error) {
      throw new ServiceUnavailableException(error);
    }
  }
}
