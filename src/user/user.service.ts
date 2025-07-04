import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { compare, hash } from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { checkPasswordDto, UpdateUserDto } from './dto/user.dto';
import { Device, Role, User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  async getUser(userId: string): Promise<Omit<User, 'password'>> {
    try {
      const user = await this.prismaService.user.findFirst({
        where: {
          id: userId,
        },
        omit: {
          password: true,
        },
      });
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (err) {
      throw new Error(err);
    }
  }

  async updateUser(userId: string, updateData: UpdateUserDto) {
    try {
      // Check if user exists
      const existingUser = await this.prismaService.user.findUnique({
        where: { id: userId },
      });

      if (!existingUser) {
        throw new Error('User not found');
      }

      // Prepare update data
      const dataToUpdate: UpdateUserDto = { ...updateData };

      // Hash password if it's being updated
      if (updateData.password) {
        const saltRounds = 10;
        dataToUpdate.password = await hash(updateData.password, saltRounds);
      }

      // Update user with only provided fields
      const updatedUser = await this.prismaService.user.update({
        where: { id: userId },
        data: dataToUpdate,
        omit: {
          password: true, // Don't return password in response
        },
      });

      return updatedUser;
    } catch (err) {
      throw new Error(err);
    }
  }

  async checkPassword(userId: string, dto: checkPasswordDto) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: {
          id: userId,
        },
      });
      if (!user) throw new Error('user not found');
      const verifyPass = await compare(dto.password, user.password);
      if (!verifyPass) throw new Error('Password does not match');
      return 'Password is correct';
    } catch (err) {
      throw new Error(err);
    }
  }
  async getFilteredUser(role: Role) {
    const user = await this.prismaService.user.findMany({
      where: {
        role: role,
      },
    });
    if (user.length == 0) throw new NotFoundException(`no ${role} found`);
    return user;
  }

  async getAllAdmins() {
    const users = await this.prismaService.user.findMany({
      where: {
        role: 'ADMIN',
      },
    });
    if (!users) throw new Error('No users for this client');
    return users;
  }
  async getUserDevices(userId: string): Promise<Device[]> {
    try {
      return await this.prismaService.device.findMany({
        where: {
          userId: userId,
          refreshToken: {
            not: undefined,
          },
        },
        select: {
          id: true,
          userId: true,
          osName: true,
          browserName: true,
          deviceIp: true,
          refreshToken: true,
          createdAt: true,
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error('Failed to fetch user devices');
    }
  }
  async changeUserRole(userId: string, role: Role) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        role: true,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.role === Role.SUPER_ADMIN) {
      throw new ForbiddenException('cant change the role of the super admin');
    }

    const updatedUser = await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        role: role,
      },
    });
    return updatedUser;
  }
}
