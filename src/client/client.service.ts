import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ClientConfig } from '@prisma/client';
import { clientDto, updateClientStatus } from './dto/client.dto';

@Injectable()
export class ClientService {
  constructor(private prisma: PrismaService) {}

  async findById(clientConfigId: string): Promise<ClientConfig | null> {
    return await this.prisma.clientConfig.findUnique({
      where: { id: clientConfigId },
    });
  }

  async createClient(data: clientDto): Promise<ClientConfig> {
    // Basic checks
    if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
      throw new Error(
        'Client name is required and must be a non-empty string.',
      );
    }
    if (
      !data.subdomain ||
      typeof data.subdomain !== 'string' ||
      !/^[a-z0-9-]+$/.test(data.subdomain)
    ) {
      throw new Error(
        'Subdomain is required and must be a lowercase alphanumeric string (dashes allowed).',
      );
    }
    if (data.logoUrl && typeof data.logoUrl !== 'string') {
      throw new Error('logoUrl must be a string if provided.');
    }
    if (data.appName && typeof data.appName !== 'string') {
      throw new Error('appName must be a string if provided.');
    }
    if (data.primaryColor && typeof data.primaryColor !== 'string') {
      throw new Error('primaryColor must be a string if provided.');
    }

    // Optionally, check for uniqueness of subdomain
    const existing = await this.prisma.clientConfig.findFirst({
      where: {
        subdomain: data.subdomain,
      },
    });
    if (existing) {
      throw new Error(
        'A client with the same slug or subdomain already exists.',
      );
    }

    return this.prisma.clientConfig.create({ data });
  }

  async getAllClients(): Promise<ClientConfig[]> {
    return this.prisma.clientConfig.findMany();
  }

  async UpdateClientStatus(dto: updateClientStatus): Promise<ClientConfig> {
    const updateClient = await this.prisma.clientConfig.update({
      where: {
        id: dto.clientId,
      },
      data: {
        service: dto.service,
      },
    });
    return updateClient;
  }
}
