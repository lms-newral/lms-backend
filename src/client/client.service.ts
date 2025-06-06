import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class ClientService {
    private prisma = new PrismaClient();

    async createClient(data: { name: string; email: string; phone?: string }) {
        return this.prisma.client.create({
            data,
        });
    }

    async getAllClients() {
        return this.prisma.client.findMany();
    }

    // Add more methods like update, delete, findById, etc.
}
