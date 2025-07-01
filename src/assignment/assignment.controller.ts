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
import { AssignmentService } from './assignment.service';
import { JwtAuthGuard } from 'src/common/guards';
import { RequestWithUser } from 'src/common/guards/auth.guard';
import { Role } from '@prisma/client';
import { Roles } from 'src/common/decorators';

@Controller('assignment')
export class AssignmentController {
  constructor(private assignmentService: AssignmentService) {}

  @Post('/create/:classId')
  @Roles(Role.TEACHER || Role.ADMIN || Role.SUPER_ADMIN)
  @UseGuards(JwtAuthGuard)
  createAssignment(
    @Param('classId') classId: string,
    @Request() req: RequestWithUser,
    @Body() dto: { assignment: string },
  ) {
    return this.assignmentService.createAssignments(classId, req.user.id, dto);
  }

  @Get('/course/:courseId')
  getAssignmentInCourse(@Param('courseId') courseId: string) {
    return this.assignmentService.getassignmentsInCourse(courseId);
  }

  @Get('/class/:classId')
  getAssignmentInClass(@Param('classId') classId: string) {
    return this.assignmentService.getassignmentsInClass(classId);
  }

  @Put('/update/:assignmentId')
  @Roles(Role.TEACHER || Role.ADMIN || Role.SUPER_ADMIN)
  @UseGuards(JwtAuthGuard)
  updateAssignment(
    @Param('assignmentId') assignmentId: string,
    @Body() dto: { assignment: string },
    @Request() req: RequestWithUser,
  ) {
    return this.assignmentService.updateassignment(
      req.user.id,
      assignmentId,
      dto,
    );
  }

  @Delete('/delete/:assignmentId')
  @Roles(Role.TEACHER || Role.ADMIN || Role.SUPER_ADMIN)
  @UseGuards(JwtAuthGuard)
  deleteAssignment(
    @Param('assignmentId') assignmentId: string,
    @Request() req: RequestWithUser,
  ) {
    return this.assignmentService.deletassignment(req.user.id, assignmentId);
  }
}
