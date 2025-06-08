import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

interface JwtPayload {
  email: string;
  name: string;
  clientId: string;
  refreshToken: string;
}
@Injectable()
export class Access_token_strategy extends PassportStrategy(Strategy, 'atjwt') {
  constructor() {
    if (!process.env.AT_SECRET) {
      throw new Error('AT_SECRET environment variable is not set');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.AT_SECRET || '',
      passReqToCallback: true,
    });
  }
  validate(payload: JwtPayload): JwtPayload {
    return payload;
  }
}
@Injectable()
export class Refresh_token_strategy extends PassportStrategy(
  Strategy,
  'rtjwt',
) {
  constructor() {
    if (!process.env.RT_SECRET) {
      throw new Error('AT_SECRET environment variable is not set');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.RT_SECRET || '',
    });
  }
  validate(req: Request, payload: JwtPayload): JwtPayload {
    const refreshToken =
      req.get('authorization')?.replace('bearer', ' ').trim() || '';

    return {
      ...payload,
      refreshToken,
    };
  }
}
