import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { ClientService } from './client.service';
import { clientDto } from './dto/client.dto';

@Controller('public/client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Get(':slug')
  getClientBySlug(@Param('slug') slug: string) {
    return this.clientService.findBySlug(slug);
  }

  @Post()
  createClient(@Body() data: clientDto) {
    return this.clientService.createClient(data);
  }

  @Get()
  getAllClients() {
    return this.clientService.getAllClients();
  }
}
