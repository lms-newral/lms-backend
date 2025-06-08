import { Body, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { loginDto, signupDto } from './dto/auth.dto';
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
  ) {}

  async requestOtp(req: Request): Promise<string> {
    try {
      const { email } = req.body;
      if (!email) throw new Error('Pls Provide Email To Send Email');
      await generateAndSendOtp(email);
      return 'OTP sent to email';
    } catch (err: any) {
      throw new Error(err.message || 'Failed to send OTP');
    }
  }
  async verifyOtp(req: Request) {
    try {
      const { email, code } = req.body;
      const verify = await OtpService.verifyOtp(email, code);
      return 'OTP verified';
    } catch (err: any) {
      throw new Error(err.message || 'OTP verification failed');
    }
  }
  //sign  access_token
  async signAccessToken(userId: string, email: string): Promise<string> {
    const accessToken = await this.jwtService.signAsync(
      {
        sub: userId,
        email,
      },
      {
        secret: process.env.AT_SECRET,
        expiresIn: 60 * 15,
      },
    );
    return accessToken;
  }
  //sign  refresh_token
  async signRefreshToken(userId: string, email: string): Promise<string> {
    const refreshToken = await this.jwtService.signAsync(
      {
        sub: userId,
        email,
      },
      {
        secret: process.env.RT_SECRET,
        expiresIn: 60 * 15,
      },
    );
    return refreshToken;
  }
  //check if the user already exists
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
  //signup
  async signup(dto: signupDto, req: Request): Promise<Tokens | null> {
    const userExists = await this.checkUser(dto.email, dto.clientId);
    if (userExists != null) {
      return null;
    }
    const ip = req.ip;
    console.log(ip);

    try {
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
        throw new Error('email does not exists');
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
      const numberOfDevices = await this.prismaService.device.findMany({
        where: {
          userId: user.id,
        },
      });
      const refreshToken = await this.signRefreshToken(user.email, user.id);
      if (device) {
        device = await this.prismaService.device.update({
          where: {
            id: device.id,
          },
          data: {
            refreshToken,
          },
        });
        if (!device && numberOfDevices.length >= user.deviceLimit) {
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
        if (!device) {
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
      }

      return {
        id: user.id,
        name: user.name,
        clientId: user.clientId as string,
        phoneNumber: user.phoneNumber as string,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified as boolean,
        refreshToken: device?.refreshToken || refreshToken, //remove "|| refereshToken" when frontend gets ready it is added bcoz you cant have device when using postmen
        profileImage: user.profileImage as string,
      };
    } catch (e) {
      console.log(e);
    }
  }
  logout() {}
  refreshTokens() {}
}
