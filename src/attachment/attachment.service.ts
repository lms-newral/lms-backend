import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Attachment, Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

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
export class AttachmentService {
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

  async createAttachment(
    classId: string,
    userId: string,
    dto: { attachment: string },
  ): Promise<Attachment> {
    const authResult = await this.checkClassAndCreator(classId, userId);

    if (!authResult.success) {
      throw new UnauthorizedException(
        'You are not authorized for posting assignments',
      );
    }
    const attachments = await this.prisma.attachment.create({
      data: {
        attachment: dto.attachment,
        classId,
        courseId: authResult.courseId,
      },
    });

    return attachments;
  }

  async getAttachmentsInClass(classId: string) {
    // First verify the class exists
    const classExists = await this.prisma.class.findUnique({
      where: { id: classId },
      select: { id: true },
    });

    if (!classExists) {
      throw new NotFoundException('Class not found');
    }

    const attachments = await this.prisma.attachment.findMany({
      where: {
        classId,
      },
      select: {
        id: true,
        attachment: true,
        createdAt: true,
      },
    });

    // Return empty array instead of throwing error - this is a valid state
    return attachments; // This will be an empty array if no attachments found
  }

  async getAttachmentsInCourse(courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: {
        id: courseId,
      },
      select: {
        classes: {
          select: {
            title: true,
            attachments: {
              select: {
                id: true,
                attachment: true,
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

  async updateAttachment(
    userId: string,
    assignmentId: string,
    dto: { attachment: string },
  ) {
    const getClassId = await this.prisma.attachment.findUnique({
      where: {
        id: assignmentId,
      },
      select: { classId: true },
    });
    if (!getClassId || !getClassId.classId) {
      throw new NotFoundException('Attachment not found');
    }
    const valid = await this.checkClassAndCreator(getClassId.classId, userId);
    if (!valid.success) {
      throw new UnauthorizedException(
        'You are not authorized to update this attachment',
      );
    }
    const updateAttachment = await this.prisma.attachment.update({
      where: {
        id: assignmentId,
      },
      data: {
        attachment: dto.attachment,
      },
    });
    return updateAttachment;
  }

  async deleteAttachment(userId: string, attachmentId: string) {
    const getClassId = await this.prisma.attachment.findUnique({
      where: {
        id: attachmentId,
      },
      select: { classId: true },
    });
    if (!getClassId || !getClassId.classId) {
      throw new NotFoundException('Attachment not found');
    }
    const valid = await this.checkClassAndCreator(getClassId.classId, userId);
    if (!valid.success) {
      throw new UnauthorizedException(
        'You are not authorized to delete this attachment',
      );
    }
    await this.prisma.attachment.delete({
      where: {
        id: attachmentId,
      },
    });
    return { message: 'attachment deleted' };
  }
}
