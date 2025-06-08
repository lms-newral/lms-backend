import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { ClientService } from './client.service';

@Controller('public/client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Get(':slug')
  getClientBySlug(@Param('slug') slug: string) {
    return this.clientService.findBySlug(slug);
  }

  @Post()
  createClient(@Body() body: any) {
    return this.clientService.createClient(body);
  }

  @Get()
  getAllClients() {
    return this.clientService.getAllClients();
  }
}
