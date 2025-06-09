import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Client } from '@prisma/client';
import { clientDto } from './dto/client.dto';

@Injectable()
export class ClientService {
  constructor(private prisma: PrismaService) {}

  async findBySlug(slug: string): Promise<Client | null> {
    return await this.prisma.client.findUnique({
      where: { slug },
    });
  }

  async createClient(data: clientDto): Promise<Client> {
    // Basic checks
    if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
      throw new Error(
        'Client name is required and must be a non-empty string.',
      );
    }
    if (
      !data.slug ||
      typeof data.slug !== 'string' ||
      !/^[a-z0-9-]+$/.test(data.slug)
    ) {
      throw new Error(
        'Slug is required and must be a lowercase alphanumeric string (dashes allowed).',
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

    // Optionally, check for uniqueness of slug or subdomain
    const existing = await this.prisma.client.findFirst({
      where: {
        OR: [{ slug: data.slug }, { subdomain: data.subdomain }],
      },
    });
    if (existing) {
      throw new Error(
        'A client with the same slug or subdomain already exists.',
      );
    }

    return this.prisma.client.create({ data });
  }

  async getAllClients(): Promise<Client[]> {
    return this.prisma.client.findMany();
  }
}
