import {
  Injectable,
  NotFoundException,
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
      console.log('Canot get user or class');
      console.log('class', getClass);
      console.log('user', user);
      return { success: false };
    }

    const isAdmin = user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN;
    console.log(isAdmin);
    const isCreator = getClass.creatorId === userId;

    if (!isAdmin && !isCreator) {
      console.log('this failed');
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
  async getAssignmentById(assigmentId: string) {
    const assignment = await this.prisma.assignment.findUnique({
      where: {
        id: assigmentId,
      },
    });

    return assignment;
  }
  async getassignmentsInClass(classId: string) {
    const assignments = await this.prisma.assignment.findMany({
      where: {
        classId,
      },
      select: {
        id: true,
        assignments: true,
        createdAt: true,
      },
    });

    return assignments;
  }
  async getassignmentsInCourse(courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: {
        id: courseId,
      },
      select: {
        classes: {
          select: {
            title: true,
            assignments: {
              select: {
                id: true,
                assignments: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course.classes;
  }
  async updateassignment(
    userId: string,
    assignmentId: string,
    dto: { assignment: string },
  ) {
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
  }
  async deletassignment(userId: string, assignmentId: string) {
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
  }
}
