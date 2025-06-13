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

@Controller('notes')
export class NotesController {
  constructor(private notesServices: NotesService) {}

  @Post('/:classId')
  @UseGuards(JwtAuthGuard)
  createNote(
    @Param('classId') classId: string,
    @Request() req: RequestWithUser,
    @Body() dto: createNotesDto,
  ) {
    return this.notesServices.createNotes(classId, req.user.id, dto);
  }

  @Get('/:courseId/course')
  getNoteInCourse(@Param('courseId') courseId: string) {
    return this.notesServices.getNotesInCourse(courseId);
  }

  @Get('/:classId/class')
  getNoteInClass(@Param('classId') classId: string) {
    return this.notesServices.getNotesInClass(classId);
  }

  @Put('/:notesId')
  @UseGuards(JwtAuthGuard)
  updateNote(
    @Param('notesId') notesId: string,
    @Body() dto: { noteHtml: string },
    @Request() req: RequestWithUser,
  ) {
    return this.notesServices.updateNote(req.user.id, notesId, dto);
  }

  @Delete('/:notesId')
  @UseGuards(JwtAuthGuard)
  deleteNote(
    @Param('notesId') notesId: string,
    @Request() req: RequestWithUser,
  ) {
    return this.notesServices.deletNote(req.user.id, notesId);
  }
}
