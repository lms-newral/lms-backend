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
import { AttachmentService } from './attachment.service';
import { JwtAuthGuard } from 'src/common/guards';
import { RequestWithUser } from 'src/common/guards/auth.guard';
import { Role } from '@prisma/client';
import { Roles } from 'src/common/decorators';

@Controller('attachment')
export class AttachmentController {
  constructor(private attachmentService: AttachmentService) {}

  @Post('/create/:classId')
  @Roles(Role.TEACHER || Role.ADMIN || Role.SUPER_ADMIN)
  @UseGuards(JwtAuthGuard)
  createAssignment(
    @Param('classId') classId: string,
    @Request() req: RequestWithUser,
    @Body() dto: { attachment: string },
  ) {
    return this.attachmentService.createAttachment(classId, req.user.id, dto);
  }

  @Get('/course/:courseId')
  getAssignmentInCourse(@Param('courseId') courseId: string) {
    return this.attachmentService.getAttachmentsInCourse(courseId);
  }

  @Get('/class/:classId')
  getAssignmentInClass(@Param('classId') classId: string) {
    return this.attachmentService.getAttachmentsInClass(classId);
  }

  @Put('/update/:attachmentId')
  @Roles(Role.TEACHER || Role.ADMIN || Role.SUPER_ADMIN)
  @UseGuards(JwtAuthGuard)
  updateAssignment(
    @Param('attachmentId') attachmentId: string,
    @Body() dto: { attachment: string },
    @Request() req: RequestWithUser,
  ) {
    return this.attachmentService.updateAttachment(
      req.user.id,
      attachmentId,
      dto,
    );
  }

  @Delete('/delete/:attachmentId')
  @Roles(Role.TEACHER || Role.ADMIN || Role.SUPER_ADMIN)
  @UseGuards(JwtAuthGuard)
  deleteAssignment(
    @Param('attachmentId') attachmentId: string,
    @Request() req: RequestWithUser,
  ) {
    return this.attachmentService.deleteAttachment(req.user.id, attachmentId);
  }
}
