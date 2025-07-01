import {
  Injectable,
  CanActivate,
  ForbiddenException,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Service } from '@prisma/client';
import { Reflector } from '@nestjs/core';

export const SkipClientCheck = () => SetMetadata('skipClientCheck', true);

interface Client {
  service: Service;
}

@Injectable()
export class ClientStatusGuard implements CanActivate {
  constructor(
    private prisma: PrismaService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const skipClientCheck = this.reflector.getAllAndOverride<boolean>(
      'skipClientCheck',
      [context.getHandler(), context.getClass()],
    );
    if (skipClientCheck) {
      return true;
    }
    try {
      const client: Client | null = await this.prisma.clientConfig.findFirst({
        select: {
          service: true,
        },
      });

      if (!client) {
        throw new ForbiddenException('Client not found');
      }

      if (client.service !== Service.ACTIVE) {
        throw new ForbiddenException('Client service is suspended');
      }

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new ForbiddenException('Unable to verify client status');
    }
  }
}
