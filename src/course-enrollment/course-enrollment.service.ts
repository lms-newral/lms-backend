import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  courseEnrollmentDto,
  updateCourseEnrollmentDto,
} from './dto/course-enrollment.dto';

@Injectable()
export class CourseEnrollmentService {
  constructor(private prisma: PrismaService) {}
  async checkStudentInCourse(dto: courseEnrollmentDto) {
    const student = await this.prisma.courseEnrollment.findFirst({
      where: {
        studentId: dto.studentId,
        courseId: dto.courseId,
      },
    });
    if (!student) return false;
    return true;
  }
  async createCourseEnrollment(dto: courseEnrollmentDto) {
    try {
      const studentInCourse = await this.checkStudentInCourse(dto);
      if (studentInCourse) {
        throw new ForbiddenException('Student is already in the course');
      }
      const courseEnrollment = await this.prisma.courseEnrollment.create({
        data: dto,
      });
      return courseEnrollment;
    } catch (error) {
      throw new ServiceUnavailableException('Something went wrong' + error);
    }
  }
  async updateCourseEnrollment(dto: updateCourseEnrollmentDto) {
    const parseDate = (date: number | Date | undefined): Date | undefined => {
      if (!date) return undefined;
      return typeof date === 'number' ? new Date(date) : date;
    };

    type UpdateData = {
      progress?: number;
      lastAccessedAt?: Date;
      completedAt?: Date;
    };

    const updateData: UpdateData = {};

    if (dto.progress !== undefined) updateData.progress = dto.progress;
    if (dto.lastAccessedAt !== undefined)
      updateData.lastAccessedAt = parseDate(dto.lastAccessedAt);
    if (dto.completedAt !== undefined)
      updateData.completedAt = parseDate(dto.completedAt);

    if (Object.keys(updateData).length === 0) return null;

    try {
      return await this.prisma.courseEnrollment.updateMany({
        where: {
          studentId: dto.studentId,
          courseId: dto.courseId,
        },
        data: updateData,
      });
    } catch {
      return null;
    }
  }
  async getAllStudentsInCourse(courseId: string) {
    try {
      const enrollments = await this.prisma.courseEnrollment.findMany({
        where: {
          courseId: courseId,
          status: 'ACTIVE', // Optional filter
        },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              profileImage: true,
              phoneNumber: true,
              isVerified: true,
            },
          },
        },
      });

      if (!enrollments) throw new NotFoundException('No students found');
      return enrollments;
    } catch (error) {
      throw new ServiceUnavailableException('Something went wrong' + error);
    }
  }
  async getAllCoursesForStudent(studentId: string) {
    try {
      const enrollments = await this.prisma.courseEnrollment.findMany({
        where: {
          studentId: studentId,
        },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              description: true,
              category: true,
              thumbnail: true,
            },
          },
        },
      });

      if (!enrollments) throw new NotFoundException('No students found');
      return enrollments;
    } catch (error) {
      throw new ServiceUnavailableException('Something went wrong' + error);
    }
  }
}
