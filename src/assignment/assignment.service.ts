import {
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { Assignment, Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { createAssignmentDto } from './dto/assignment.dto';

interface ClassAuthResult {
  success: true;
  courseId: string;
}

interface ClassAuthFailure {
  success: false;
}

type ClassAuthResponse = ClassAuthResult | ClassAuthFailure;

interface ClassData {
  creatorId: string;
  courseId: string;
}

interface UserData {
  role: Role;
}

@Injectable()
export class AssignmentService {
  constructor(private prisma: PrismaService) {}

  async checkClassAndCreator(
    classId: string,
    userId: string,
  ): Promise<ClassAuthResponse> {
    const getClass: ClassData | null = await this.prisma.class.findUnique({
      where: {
        id: classId,
      },
      select: {
        creatorId: true,
        courseId: true,
      },
    });

    const user: UserData | null = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!getClass || !user) {
      return { success: false };
    }

    const isAdmin = user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN;
    const isCreator = getClass.creatorId === userId;

    if (!isAdmin && !isCreator) {
      return { success: false };
    }

    return { success: true, courseId: getClass.courseId };
  }

  async createAssignments(
    classId: string,
    userId: string,
    dto: createAssignmentDto,
  ): Promise<Assignment> {
    const authResult = await this.checkClassAndCreator(classId, userId);

    if (!authResult.success) {
      throw new UnauthorizedException(
        'You are not authorized for posting assignments',
      );
    }
    const assignment = await this.prisma.assignment.create({
      data: {
        assignments: dto.assignment,
        classId,
        courseId: authResult.courseId,
      },
    });

    return assignment;
  }
  async getassignmentsInClass(classId: string) {
    try {
      const assignments = await this.prisma.assignment.findMany({
        where: {
          classId,
        },
      });
      if (!assignments || assignments[0]) {
        throw new NotFoundException('assignments not found');
      }
      return assignments;
    } catch (error) {
      throw new ServiceUnavailableException(error);
    }
  }
  async getassignmentsInCourse(courseId: string) {
    try {
      const assignments = await this.prisma.assignment.findMany({
        where: {
          courseId,
        },
      });
      if (!assignments || assignments[0]) {
        throw new NotFoundException('assignments not found');
      }
      return assignments;
    } catch (error) {
      throw new ServiceUnavailableException(error);
    }
  }
  async updateassignment(
    userId: string,
    assignmentId: string,
    dto: { assignment: string },
  ) {
    try {
      const getClassId = await this.prisma.assignment.findUnique({
        where: {
          id: assignmentId,
        },
        select: { classId: true },
      });
      if (!getClassId || !getClassId.classId) {
        throw new NotFoundException('Class not found');
      }
      const valid = await this.checkClassAndCreator(getClassId.classId, userId);
      if (!valid.success) {
        throw new UnauthorizedException(
          'You are not authorized to update this assignment',
        );
      }
      const updateassignment = await this.prisma.assignment.update({
        where: {
          id: assignmentId,
        },
        data: {
          assignments: dto.assignment,
        },
      });
      return updateassignment;
    } catch (e) {
      throw new ServiceUnavailableException(e);
    }
  }
  async deletassignment(userId: string, assignmentId: string) {
    try {
      const getClassId = await this.prisma.assignment.findUnique({
        where: {
          id: assignmentId,
        },
        select: { classId: true },
      });
      if (!getClassId || !getClassId.classId) {
        throw new NotFoundException('Class not found');
      }
      const valid = await this.checkClassAndCreator(getClassId.classId, userId);
      if (!valid.success) {
        throw new UnauthorizedException(
          'You are not authorized to delete this assignment',
        );
      }
      await this.prisma.assignment.delete({
        where: {
          id: assignmentId,
        },
      });
      return { data: 'assignment deleted' };
    } catch (e) {
      throw new ServiceUnavailableException(e);
    }
  }
}
