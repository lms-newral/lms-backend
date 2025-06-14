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
import { NotesService } from './notes.service';
import { createNotesDto } from './dto/notes.dto';
import { JwtAuthGuard } from 'src/common/guards';
import { RequestWithUser } from 'src/common/guards/auth.guard';
import { Roles } from 'src/common/decorators';
import { Role } from '@prisma/client';

@Controller('notes')
export class NotesController {
  constructor(private notesServices: NotesService) {}

  @Post('/create/:classId')
  @Roles(Role.TEACHER || Role.ADMIN || Role.SUPER_ADMIN)
  @UseGuards(JwtAuthGuard)
  createNote(
    @Param('classId') classId: string,
    @Request() req: RequestWithUser,
    @Body() dto: createNotesDto,
  ) {
    return this.notesServices.createNotes(classId, req.user.id, dto);
  }

  @Get('/course/:courseId')
  getNoteInCourse(@Param('courseId') courseId: string) {
    return this.notesServices.getNotesInCourse(courseId);
  }

  @Get('/class/:classId')
  getNoteInClass(@Param('classId') classId: string) {
    return this.notesServices.getNotesInClass(classId);
  }

  @Put('/update/:notesId')
  @Roles(Role.TEACHER || Role.ADMIN || Role.SUPER_ADMIN)
  @UseGuards(JwtAuthGuard)
  updateNote(
    @Param('notesId') notesId: string,
    @Body() dto: { notesHtml: string },
    @Request() req: RequestWithUser,
  ) {
    return this.notesServices.updateNote(req.user.id, notesId, dto);
  }

  @Delete('/delete/:notesId')
  @Roles(Role.TEACHER || Role.ADMIN || Role.SUPER_ADMIN)
  @UseGuards(JwtAuthGuard)
  deleteNote(
    @Param('notesId') notesId: string,
    @Request() req: RequestWithUser,
  ) {
    return this.notesServices.deletNote(req.user.id, notesId);
  }
}
