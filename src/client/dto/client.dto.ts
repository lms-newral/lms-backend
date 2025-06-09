import { IsNotEmpty, IsString } from 'class-validator';

export class clientDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsNotEmpty()
  subdomain: string;
  logoUrl?: string;
  appName?: string;
  primaryColor?: string;
}
