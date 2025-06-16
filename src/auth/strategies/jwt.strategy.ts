import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

interface JwtPayload {
  sub: string; // User ID
  email: string;
  iat?: number; // Issued at
  exp?: number; // Expires at
}

interface JwtPayloadWithRefreshToken extends JwtPayload {
  refreshToken: string;
}

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    if (!process.env.AT_SECRET) {
      throw new Error('AT_SECRET environment variable is not set');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.AT_SECRET,
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    return payload;
  }
}

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    if (!process.env.RT_SECRET) {
      throw new Error('RT_SECRET environment variable is not set');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.RT_SECRET,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: JwtPayload): JwtPayloadWithRefreshToken {
    const refreshToken =
      req.get('Authorization')?.replace('Bearer ', '').trim() || '';
    return {
      ...payload,
      refreshToken,
    };
  }
}
