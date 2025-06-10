import { Controller, Param, Get, Body, Post, Put } from '@nestjs/common';
import { UserService } from './user.service';
import { checkPasswordDto, UpdateUserDto } from './dto/user.dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/:userId')
  getUser(@Param('userId') userId: string) {
    return this.userService.getUser(userId);
  }
  @Post('/checkPassword/:userId')
  checkPassword(
    @Param('userId') userId: string,
    @Body() dto: checkPasswordDto,
  ) {
    return this.userService.checkPassword(userId, dto);
  }
  @Put('/updateUser/:userId')
  updateUser(
    @Param('userId') userId: string,
    @Body() updateData: UpdateUserDto,
  ) {
    return this.userService.updateUser(userId, updateData);
  }
  @Get('/getStudents/:clientSlug')
  getAllStudents(@Param('clientSlug') clientSlug: string) {
    return this.userService.getAllStudentsForClient(clientSlug);
  }

  @Get('/getTeachers/:clientSlug')
  getAllTeachers(@Param('clientSlug') clientSlug: string) {
    return this.userService.getAllTeachersForClient(clientSlug);
  }
  @Get('/devices/:userId')
  getUserDevices(@Param('userId') userId: string) {
    return this.userService.getUserDevices(userId);
  }
}
