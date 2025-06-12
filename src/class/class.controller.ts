import { Controller } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('class')
export class ClassController {
  constructor(private prisma: PrismaService) {}
}
