import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { CourseEnrollmentService } from './course-enrollment.service';
import {
  courseEnrollmentDto,
  updateCourseEnrollmentDto,
} from './dto/course-enrollment.dto';

@Controller('course-enrollment')
export class CourseEnrollmentController {
  constructor(private CourseEnrollmentService: CourseEnrollmentService) {}
  @Post('/enroll')
  createCourseEnrollment(@Body() dto: courseEnrollmentDto) {
    return this.CourseEnrollmentService.createCourseEnrollment(dto);
  }
  @Put('/update')
  updateCourseEnrollment(@Body() dto: updateCourseEnrollmentDto) {
    return this.CourseEnrollmentService.updateCourseEnrollment(dto);
  }
  @Get('/students/:courseId')
  getAllStudentInCourse(@Param('courseId') courseId: string) {
    return this.CourseEnrollmentService.getAllStudentsInCourse(courseId);
  }
  @Get('/courses/:studentId')
  getAllCoursesForStudent(@Param('studentId') studentId: string) {
    return this.CourseEnrollmentService.getAllCoursesForStudent(studentId);
  }
}
