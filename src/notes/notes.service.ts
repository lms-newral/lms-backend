import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Note, Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { createNotesDto } from './dto/notes.dto';

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
export class NotesService {
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
    if (!getClass) {
      throw new NotFoundException('Class not found');
    }
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isAdmin = user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN;
    const isCreator = getClass.creatorId === userId;

    if (!isAdmin && !isCreator) {
      return { success: false };
    }

    return { success: true, courseId: getClass.courseId };
  }

  async createNotes(
    classId: string,
    userId: string,
    dto: createNotesDto,
  ): Promise<Note> {
    const authResult = await this.checkClassAndCreator(classId, userId);

    if (!authResult.success) {
      throw new UnauthorizedException(
        'You are not authorized for posting notes',
      );
    }
    const createNotes = await this.prisma.note.create({
      data: {
        notesHtml: dto.notesHtml,
        classId,
        courseId: authResult.courseId,
      },
    });

    return createNotes;
  }
  async getNotesInClass(classId: string) {
    const classes = await this.prisma.class.findUnique({
      where: {
        id: classId,
      },
      select: {
        notes: {
          select: {
            id: true,
            notesHtml: true,
            createdAt: true,
          },
        },
      },
    });
    if (!classes) {
      throw new NotFoundException('Class not found');
    }
    if (!classes.notes || classes.notes.length === 0) {
      throw new NotFoundException('notes not found');
    }
    return classes.notes;
  }
  async getNotesInCourse(courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: {
        id: courseId,
      },
      select: {
        classes: {
          select: {
            title: true,
            notes: {
              select: {
                id: true,
                notesHtml: true,
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
  async updateNote(userId: string, noteId: string, dto: { notesHtml: string }) {
    const getClassId = await this.prisma.note.findUnique({
      where: {
        id: noteId,
      },
      select: { classId: true },
    });
    if (!getClassId || !getClassId.classId) {
      throw new NotFoundException('Class not found');
    }
    const valid = await this.checkClassAndCreator(getClassId.classId, userId);
    if (!valid.success) {
      throw new UnauthorizedException(
        'You are not authorized to update this note',
      );
    }
    const updateNote = await this.prisma.note.update({
      where: {
        id: noteId,
      },
      data: {
        notesHtml: dto.notesHtml,
      },
    });
    return updateNote;
  }
  async deletNote(userId: string, noteId: string) {
    const getClassId = await this.prisma.note.findUnique({
      where: {
        id: noteId,
      },
      select: { classId: true },
    });
    if (!getClassId || !getClassId.classId) {
      throw new NotFoundException('Class not found');
    }
    const valid = await this.checkClassAndCreator(getClassId.classId, userId);
    if (!valid.success) {
      throw new UnauthorizedException(
        'You are not authorized to delete this note',
      );
    }
    await this.prisma.note.delete({
      where: {
        id: noteId,
      },
    });
    return { data: 'Note deleted' };
  }
}
