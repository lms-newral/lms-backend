import { Controller, Get, Post, Body } from '@nestjs/common';
import { ClientService } from './client.service';
// import { Client } from '@prisma/client'; // Removed because '@prisma/client' has no exported member 'Client'

@Controller('clients')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Post()
  async create(@Body() data: { name: string; email: string; phone?: string }): Promise<any> {
    return this.clientService.createClient(data);
  }

  @Get()
  async findAll(): Promise<any[]> {
    return this.clientService.getAllClients();
  }
}
