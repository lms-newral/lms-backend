import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Device } from '@prisma/client';
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  // devices: Device[];
  createdAt: Date;
}

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  public async getUsers() {
    return this.prisma.user.findMany();
  }

  public async getUserById(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      //devices: user.devices,
      createdAt: user.createdAt,
    };
  }
}
