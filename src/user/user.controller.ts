import {
  Controller,
  Param,
  Get,
  Body,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { checkPasswordDto, UpdateUserDto } from './dto/user.dto';
import { Role, User } from '@prisma/client';
import { Roles } from 'src/common/decorators';
import { JwtAuthGuard } from 'src/common/guards';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/devices/:userId')
  getUserDevices(@Param('userId') userId: string) {
    return this.userService.getUserDevices(userId);
  }
  @Get('/filter')
  getFilteredUser(@Query('role') role: Role) {
    return this.userService.getFilteredUser(role);
  }

  @Get('/:userId')
  getUser(@Param('userId') userId: string): Promise<Omit<User, 'password'>> {
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
  //@UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN || Role.SUPER_ADMIN)
  @Put('/role/:userId')
  changeUserRole(@Param('userId') userId: string, @Body() dto: { role: Role }) {
    return this.userService.changeUserRole(userId, dto.role);
  }
}
