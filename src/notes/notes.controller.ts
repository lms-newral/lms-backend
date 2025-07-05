import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';

import { JwtAuthGuard } from 'src/common/guards';
import { RequestWithUser } from 'src/common/guards/auth.guard';
import { Roles } from 'src/common/decorators';

import { NotesService } from './notes.service';
import { createNotesDto } from './dto/notes.dto';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  // ────────────────────────────────────────────────────────────
  // CREATE
  // ────────────────────────────────────────────────────────────
  @Post('/create/:classId')
  @Roles(Role.TEACHER, Role.ADMIN, Role.SUPER_ADMIN)
  @UseGuards(JwtAuthGuard)
  createNote(
    @Param('classId') classId: string,
    @Request() req: RequestWithUser,
    @Body() dto: createNotesDto,
  ) {
    return this.notesService.createNotes(classId, req.user.id, dto);
  }

  // ────────────────────────────────────────────────────────────
  // READ
  // ────────────────────────────────────────────────────────────
  @Get('/course/:courseId')
  getNotesInCourse(@Param('courseId') courseId: string) {
    return this.notesService.getNotesInCourse(courseId);
  }

  @Get('/getNoteById/:notesId')
  getNoteById(@Param('notesId') notesId: string) {
    return this.notesService.getNoteById(notesId);
  }

  @Get('/class/:classId')
  getNotesInClass(@Param('classId') classId: string) {
    return this.notesService.getNotesInClass(classId);
  }

  // ────────────────────────────────────────────────────────────
  // UPDATE
  // ────────────────────────────────────────────────────────────
  @Put('/update/:notesId')
  @Roles(Role.TEACHER, Role.ADMIN, Role.SUPER_ADMIN)
  @UseGuards(JwtAuthGuard)
  updateNote(
    @Param('notesId') notesId: string,
    @Body() dto: { notesHtml: string },
    @Request() req: RequestWithUser,
  ) {
    return this.notesService.updateNote(req.user.id, notesId, dto);
  }

  // ────────────────────────────────────────────────────────────
  // DELETE
  // ────────────────────────────────────────────────────────────
  @Delete('/delete/:notesId')
  @Roles(Role.TEACHER, Role.ADMIN, Role.SUPER_ADMIN)
  @UseGuards(JwtAuthGuard)
  deleteNote(
    @Param('notesId') notesId: string,
    @Request() req: RequestWithUser,
  ) {
    return this.notesService.deletNote(req.user.id, notesId);
  }
}
