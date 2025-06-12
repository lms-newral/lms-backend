import { IsNotEmpty, IsString } from 'class-validator';

export class clientDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  subdomain: string;

  logoUrl?: string;
  appName?: string;
  primaryColor?: string;
}

export class updateClientStatus {
  @IsString()
  @IsNotEmpty()
  clientId: string;

  service: Service;
}

enum Service {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
}
