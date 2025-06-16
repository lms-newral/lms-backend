import { Controller, Get, Param, Post, Body, Put } from '@nestjs/common';
import { ClientService } from './client.service';
import { clientDto, updateClientStatus } from './dto/client.dto';
import { ClientConfig, Role } from '@prisma/client';
import { Roles } from 'src/common/decorators';
import { SkipClientCheck } from 'src/common/guards/clientStatus.guard';

@Controller('public/clientConfig')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Get('/:clientConfigId')
  getClientById(
    @Param('clientConfigId') clientConfigId: string,
  ): Promise<ClientConfig | null> {
    return this.clientService.findById(clientConfigId);
  }

  @Post()
  @SkipClientCheck()
  createClient(@Body() data: clientDto) {
    return this.clientService.createClient(data);
  }

  @Get()
  getAllClients(): Promise<ClientConfig[]> {
    return this.clientService.getAllClients();
  }
  @Put('/update')
  @SkipClientCheck()
  // @Roles(Role.SUPER_ADMIN)
  updatClientStatus(@Body() dto: updateClientStatus): Promise<ClientConfig> {
    return this.clientService.UpdateClientStatus(dto);
  }
}
