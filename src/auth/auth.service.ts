import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  checkUserDto,
  loginDto,
  logoutDto,
  refreshTokenDto,
  requestOtpDto,
  signupDto,
} from './dto/auth.dto';
import { compare, hash } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UAParser, IResult } from 'ua-parser-js';
import { Device } from '@prisma/client';
import { OtpService } from 'src/services/services.service';
import { NotFoundError } from 'rxjs';

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

  // Check if the user already exists
  async checkEmail(dto: checkUserDto): Promise<boolean> {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    return !!user;
  }
  async checkUsername(dto: { username: string }): Promise<boolean> {
    const user = await this.prismaService.user.findUnique({
      where: {
        username: dto.username,
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
        expiresIn: '15m',
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
        expiresIn: '7d',
      },
    );
    return refreshToken;
  }

  async checkUser(email: string) {
    try {
      const user = await this.prismaService.user.findFirst({
        where: {
          email,
        },
      });
      return user;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  //Signup Teacher
  async signupTeacher(dto: signupDto): Promise<any> {
    const userExists = await this.checkUser(dto.email);
    if (userExists != null) {
      return null;
    }
    const verify = await this.otpService.verifyOtp(dto.email, dto.code);
    if (!verify) {
      throw new Error('OTP does not match');
    }
    const hashedPassword = await hash(dto.password, 10);
    const newUser = await this.prismaService.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        username: dto.username, // Add this line to provide the required username property
        password: hashedPassword,
        phoneNumber: dto.phoneNumber,
        profileImage: dto.profileImage,
        deviceLimit: 5,
        role: 'TEACHER',
        isVerified: true,
      },
    });
    const access_token = await this.signAccessToken(newUser.id, newUser.email); // returns access_token
    const refresh_token = await this.signRefreshToken(
      newUser.id,
      newUser.email,
    ); // returns refresh_token

    return { accesToken: access_token, refreshToken: refresh_token };
  }

  // Signup
  async signup(dto: signupDto, req: Request): Promise<any> {
    const userExists = await this.checkUser(dto.email);
    if (userExists != null) {
      throw new ForbiddenException('email already exists');
    }
    if (!req.headers['user-agent']) return null;

    const ip = req.ip;
    const userAgent = req.headers['user-agent'];
    const parser = new UAParser(userAgent);

    const verify = await this.otpService.verifyOtp(dto.email, dto.code);
    if (!verify) {
      throw new Error('OTP does not match');
    }
    const hashedPassword = await hash(dto.password, 10);
    const newUser = await this.prismaService.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        name: dto.name,
        password: hashedPassword as string,
        phoneNumber: dto.phoneNumber,
        profileImage: dto.profileImage,

        isVerified: true,
      },
    });
    const access_token = await this.signAccessToken(newUser.id, newUser.email); // returns access_token
    const refresh_token = await this.signRefreshToken(
      newUser.id,
      newUser.email,
    ); // returns refresh_token

    const deviceInfo: IResult = parser.getResult();
    // Create new device
    const device = await this.prismaService.device.create({
      data: {
        osName: deviceInfo.os.name || '',
        browserName: deviceInfo.browser.name || '',
        deviceIp: ip || '',
        userId: newUser.id,
        refreshToken: refresh_token,
      },
    });
    return {
      user: {
        id: newUser.id,
        name: newUser.name,
        phoneNumber: newUser.phoneNumber as string,
        email: newUser.email,
        role: newUser.role,
        isVerified: newUser.isVerified,
        profileImage: newUser.profileImage as string,
        deviceId: device.id,
      },
      accesstoken: access_token,
      refreshToken: device?.refreshToken || refresh_token, // Remove "|| refreshToken" when frontend gets ready
    };
  }
  async login(dto: loginDto, req: Request): Promise<any> {
    const user = await this.checkUser(dto.email);
    if (!user) {
      throw new NotFoundError('Email does not exist');
    }
    const comparePassword = await compare(dto.password, user.password);
    if (!comparePassword) {
      throw new ForbiddenException('Password is incorrect');
    }
    if (!req.headers['user-agent']) return;

    const ip = req.ip;
    const userAgent = req.headers['user-agent'];
    const parser = new UAParser(userAgent);

    const deviceInfo: IResult = parser.getResult();
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
    const accesstoken = await this.signAccessToken(user.id, user.email);
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
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        phoneNumber: user.phoneNumber as string,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        deviceId: device.id,
        profileImage: user.profileImage as string,
      },
      accesstoken,
      refreshToken: device?.refreshToken || refreshToken, // Remove "|| refreshToken" when frontend gets ready
    };
  }

  async logout(dto: logoutDto): Promise<string> {
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
  }

  async refreshTokens(dto: refreshTokenDto): Promise<any> {
    // Verify the refresh token
    interface JwtPayload {
      sub: string;
      email: string;
      [key: string]: any;
    }

    const payload = await this.jwtService.verifyAsync<JwtPayload>(
      dto.refreshToken,
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
        refreshToken: dto.refreshToken,
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
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        phoneNumber: (user.phoneNumber as string) || '',
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        profileImage: (user.profileImage as string) || '',
        deviceId: device.id,
      },
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
  // Helper method to logout from specific device - deletes device entirely
  async logoutFromDevice(userId: string, deviceId: string): Promise<string> {
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
  }
}
