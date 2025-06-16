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
import { createClassDto, updateClassDto } from './dto/class.dto';
import { JwtAuthGuard } from 'src/common/guards';
import { ClassService } from './class.service';
import { RequestWithUser } from 'src/common/guards/auth.guard';
import { Role } from '@prisma/client';
import { Roles } from 'src/common/decorators';

@Controller('class')
export class ClassController {
  constructor(private classService: ClassService) {}
  @Get('/all/:courseId')
  @UseGuards(JwtAuthGuard)
  getClassesInCourse(@Param('courseId') courseId: string) {
    return this.classService.getClassesInCourse(courseId);
  }
  @Put('/update/:classId')
  @UseGuards(JwtAuthGuard)
  updateClass(
    @Body() dto: updateClassDto,
    @Request() req: RequestWithUser,
    @Param('classId') classId: string,
  ) {
    return this.classService.updateClass(dto, req.user.id, classId);
  }
  @Post('/create/:courseId')
  @UseGuards(JwtAuthGuard)
  createClass(
    @Body() dto: createClassDto,
    @Request() req: RequestWithUser,
    @Param('courseId') courseId: string,
  ) {
    return this.classService.createClass(dto, req.user.id, courseId);
  }

  @Delete('/delete/:classId')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN || Role.TEACHER || Role.SUPER_ADMIN)
  deleteClass(
    @Param('classId') classId: string,
    @Request() req: RequestWithUser,
  ) {
    return this.classService.deleteClass(classId, req.user.id);
  }
}
