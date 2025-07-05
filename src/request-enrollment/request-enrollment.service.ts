import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RequestEnrollmentService {
  constructor(private prisma: PrismaService) {}
  async checkUser(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) {
      return false;
    }
    return true;
  }
  async checkCourse(courseId: string): Promise<boolean> {
    const course = await this.prisma.course.findUnique({
      where: {
        id: courseId,
      },
    });
    if (!course) return false;
    return true;
  }

  async postRequest(dto: { studentId: string; courseId: string }) {
    if (!dto.courseId || !dto.studentId) {
      throw new ForbiddenException(
        'You need to pass both studentId and courseId',
      );
    }
    if (!(await this.checkCourse(dto.courseId))) {
      throw new NotFoundException('Course not found');
    }

    if (!(await this.checkUser(dto.studentId))) {
      throw new NotFoundException('Student Not found');
    }
    const alreadyenrolled = await this.prisma.courseEnrollment.findFirst({
      where: {
        studentId: dto.studentId,
        courseId: dto.courseId,
      },
    });
    if (alreadyenrolled) {
      console.log(alreadyenrolled);
      throw new ForbiddenException('You are already enrolled in this course');
    }
    const alreadyRequested = await this.prisma.enrollmentRequest.findFirst({
      where: {
        studentId: dto.studentId,
        courseId: dto.courseId,
      },
    });
    if (alreadyRequested) {
      throw new ForbiddenException(
        'You have already requested for this course ',
      );
    }
    const request = await this.prisma.enrollmentRequest.create({
      data: {
        studentId: dto.studentId,
        courseId: dto.courseId,
        status: 'PENDING',
      },
    });
    if (!request) {
      throw new InternalServerErrorException('Something went wrong');
    }
    return { message: 'Request send successfully' };
  }

  async getRequestsById(requestId: string) {
    if (!requestId) {
      throw new ForbiddenException('You need to pass  requestId');
    }
    const request = await this.prisma.enrollmentRequest.findUnique({
      where: {
        id: requestId,
      },
      select: {
        status: true,
        course: true,
        courseId: true,
        student: true,
        studentId: true,
      },
    });
    if (!request?.student) {
      throw new NotFoundException('User not found ');
    }
    if (!request?.course) {
      throw new NotFoundException('Course not found ');
    }
    return request;
  }

  async getPendingRequests() {
    const request = await this.prisma.enrollmentRequest.findMany({
      where: {
        status: 'PENDING',
      },
      select: {
        id: true,
        course: true,
        courseId: true,
        student: true,
        studentId: true,
      },
    });

    return request;
  }
  async getRequests() {
    const request = await this.prisma.enrollmentRequest.findMany({
      select: {
        status: true,
        course: true,
        courseId: true,
        student: true,
        studentId: true,
      },
    });

    return request;
  }
  async acceptRequest(requestId: string) {
    const getRequest = await this.prisma.enrollmentRequest.findUnique({
      where: { id: requestId },
      select: {
        courseId: true,
        studentId: true,
      },
    });

    if (!getRequest?.studentId || !getRequest?.courseId) {
      throw new InternalServerErrorException(
        'Invalid enrollment request: missing studentId or courseId',
      );
    }

    // Using Prisma interactive transaction
    await this.prisma.$transaction(async (prisma) => {
      // Create the course enrollment
      await prisma.courseEnrollment.create({
        data: {
          studentId: getRequest.studentId,
          courseId: getRequest.courseId,
        },
      });

      // Update the enrollment request status
      await prisma.enrollmentRequest.update({
        where: {
          id: requestId,
        },
        data: {
          status: 'ACCEPTED',
        },
      });
    });
    return { message: 'Enrollment sucessfull' };
  }
  async deleteRequest(requestId: string) {
    const getRequest = await this.prisma.enrollmentRequest.findUnique({
      where: { id: requestId },
      select: {
        courseId: true,
        studentId: true,
      },
    });

    if (!getRequest?.studentId || !getRequest?.courseId) {
      throw new InternalServerErrorException(
        'Invalid enrollment request: missing studentId or courseId',
      );
    }
    await this.prisma.enrollmentRequest.delete({
      where: {
        id: requestId,
      },
    });

    return { message: 'Enrollment rejected' };
  }
}
