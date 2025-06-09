import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  checkUserDto,
  loginDto,
  logoutDto,
  requestOtpDto,
  signupDto,
} from './dto/auth.dto';
import { compare, hash } from 'bcrypt';
import { Tokens } from './types';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UAParser, IResult } from 'ua-parser-js';
import { Device } from '@prisma/client';
import { OtpService } from 'src/services/services.service';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private otpService: OtpService,
  ) {}

  async requestOtp(dto: requestOtpDto): Promise<string> {
    try {
      if (!dto.email) throw new Error('Please provide email to send OTP');
      await this.otpService.generateAndSendOtp(dto.email);
      return 'OTP sent to email';
    } catch (err: any) {
      console.log(err);
      throw new Error('Failed to send OTP');
    }
  }

  async verifyOtpHandler(email: string, code: string): Promise<string> {
    try {
      const verify = await this.otpService.verifyOtp(email, code);
      if (!verify) return 'Wrong OTP';
      return 'OTP verified';
    } catch (err: any) {
      console.log(err);
      throw new Error('OTP verification failed');
    }
  }

  async checkEmail(dto: checkUserDto): Promise<boolean> {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: dto.email,
        clientId: dto.clientId,
      },
    });
    return !!user;
  }

  // Sign access_token
  async signAccessToken(userId: string, email: string): Promise<string> {
    const accessToken = await this.jwtService.signAsync(
      {
        sub: userId,
        email,
      },
      {
        secret: process.env.AT_SECRET,
        expiresIn: '15m', // Better to use string format
      },
    );
    return accessToken;
  }

  // Sign refresh_token
  async signRefreshToken(userId: string, email: string): Promise<string> {
    const refreshToken = await this.jwtService.signAsync(
      {
        sub: userId,
        email,
      },
      {
        secret: process.env.RT_SECRET,
        expiresIn: '7d', // Refresh tokens should have longer expiry
      },
    );
    return refreshToken;
  }

  // Check if the user already exists
  async checkUser(email: string, clientId: string) {
    try {
      const user = await this.prismaService.user.findFirst({
        where: {
          email,
          clientId,
        },
      });
      return user;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  // Signup
  async signup(dto: signupDto, req: Request): Promise<Tokens | null> {
    console.log(dto.code);
    const userExists = await this.checkUser(dto.email, dto.clientId);
    if (userExists != null) {
      return null;
    }
    const ip = req.ip;
    console.log(ip);

    try {
      const verify = await this.otpService.verifyOtp(dto.email, dto.code);
      if (!verify) {
        throw new Error('OTP does not match');
      }
      const hashedPassword = await hash(dto.password, 10);
      const newUser = await this.prismaService.user.create({
        data: {
          email: dto.email,
          name: dto.name,
          password: hashedPassword,
          clientId: dto.clientId,
        },
      });
      const access_token = await this.signAccessToken(
        newUser.id,
        newUser.email,
      ); // returns access_token
      const refresh_token = await this.signRefreshToken(
        newUser.id,
        newUser.email,
      ); // returns refresh_token

      return { access_token, refresh_token };
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async login(dto: loginDto, req: Request): Promise<any> {
    try {
      const checkClient = await this.prismaService.client.findUnique({
        where: {
          id: dto.clientId,
        },
      });
      if (!checkClient) {
        throw new Error('Client does not exist');
      }
      const user = await this.checkUser(dto.email, dto.clientId);
      if (!user) {
        throw new Error('Email does not exist');
      }
      const comparePassword = await compare(dto.password, user.password);
      if (!comparePassword) {
        throw new Error('Password is incorrect');
      }
      if (!req.headers['user-agent']) return;

      const ip = req.ip;
      const userAgent = req.headers['user-agent'];
      const parser = new UAParser(userAgent);

      const deviceInfo: IResult = parser.getResult();

      console.log(deviceInfo);
      let device: Device | null;
      device = await this.prismaService.device.findFirst({
        where: {
          osName: deviceInfo.os.name,
          browserName: deviceInfo.browser.name,
          deviceIp: ip,
          userId: user.id,
        },
      });

      const activeDevices = await this.prismaService.device.findMany({
        where: {
          userId: user.id,
          refreshToken: {
            not: undefined,
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      const refreshToken = await this.signRefreshToken(user.id, user.email);

      if (device) {
        // Update existing device
        device = await this.prismaService.device.update({
          where: {
            id: device.id,
          },
          data: {
            refreshToken,
          },
        });
      } else {
        // Check if we need to remove oldest device when limit is exceeded
        if (activeDevices.length >= user.deviceLimit) {
          // Remove the oldest active device
          const oldestDevice = activeDevices[0];
          await this.prismaService.device.delete({
            where: {
              id: oldestDevice.id,
            },
          });
          console.log(
            `Removed oldest device ${oldestDevice.id} for user ${user.id} due to device limit`,
          );
        }

        // Create new device
        device = await this.prismaService.device.create({
          data: {
            osName: deviceInfo.os.name || '',
            browserName: deviceInfo.browser.name || '',
            deviceIp: ip || '',
            userId: user.id,
            refreshToken,
          },
        });
      }

      return {
        id: user.id,
        name: user.name,
        clientId: user.clientId,
        phoneNumber: user.phoneNumber as string,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        refreshToken: device?.refreshToken || refreshToken, // Remove "|| refreshToken" when frontend gets ready
        profileImage: user.profileImage as string,
      };
    } catch (e) {
      console.log(e);
      throw e; // Re-throw the error instead of returning undefined
    }
  }

  async logout(dto: logoutDto): Promise<string> {
    try {
      if (dto.deviceId) {
        // Logout from specific device - delete the device entirely
        await this.prismaService.device.delete({
          where: {
            id: dto.deviceId,
            userId: dto.userId,
          },
        });
        return 'Logged out and removed device successfully';
      } else {
        // Logout from all devices - delete all user devices
        const deletedDevices = await this.prismaService.device.deleteMany({
          where: {
            userId: dto.userId,
          },
        });
        return `Logged out and removed ${deletedDevices.count} devices successfully`;
      }
    } catch (error) {
      console.log(error);
      throw new Error('Logout failed');
    }
  }

  async refreshTokens(refreshToken: string): Promise<Tokens | null> {
    try {
      // Verify the refresh token
      interface JwtPayload {
        sub: string;
        email: string;
        [key: string]: any;
      }

      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        refreshToken,
        {
          secret: process.env.RT_SECRET,
        },
      );

      const userId: string = payload.sub;
      const email: string = payload.email;

      // Check if user exists
      const user = await this.prismaService.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Find the device with this refresh token
      const device = await this.prismaService.device.findFirst({
        where: {
          refreshToken: refreshToken,
          userId: userId,
        },
      });

      if (!device) {
        throw new Error('Invalid refresh token or device not found');
      }

      // Generate new tokens
      const newAccessToken = await this.signAccessToken(userId, email);
      const newRefreshToken = await this.signRefreshToken(userId, email);

      // Update the device with new refresh token
      await this.prismaService.device.update({
        where: {
          id: device.id,
        },
        data: {
          refreshToken: newRefreshToken,
        },
      });

      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      };
    } catch (error) {
      console.log(error);

      // If token is expired or invalid, clean up the device by deleting it
      try {
        await this.prismaService.device.deleteMany({
          where: {
            refreshToken: refreshToken,
          },
        });
      } catch (cleanupError) {
        console.log('Failed to cleanup invalid refresh token:', cleanupError);
      }

      throw new Error('Token refresh failed');
    }
  }

  // Helper method to get user's devices
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

  // Helper method to logout from specific device - deletes device entirely
  async logoutFromDevice(userId: string, deviceId: string): Promise<string> {
    try {
      const device = await this.prismaService.device.findFirst({
        where: {
          id: deviceId,
          userId: userId,
        },
      });

      if (!device) {
        throw new Error('Device not found');
      }

      await this.prismaService.device.delete({
        where: {
          id: deviceId,
        },
      });

      return 'Logged out and removed device successfully';
    } catch (error) {
      console.log(error);
      throw new Error('Failed to logout from device');
    }
  }
}
