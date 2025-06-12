import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ClientController } from './client/client.controller';
import { ClientService } from './client/client.service';
import { ClientModule } from './client/client.module';
import { ServicesModule } from './services/services.module';
import { UserService } from './user/user.service';
import { UserController } from './user/user.controller';
import { UserModule } from './user/user.module';
import { CourseModule } from './course/course.module';
import { ClassModule } from './class/class.module';
import { ClientStatusGuard } from './common/guards/clientStatus.guard';
import { CourseEnrollmentService } from './course-enrollment/course-enrollment.service';
import { CourseEnrollmentController } from './course-enrollment/course-enrollment.controller';
import { CourseEnrollmentModule } from './course-enrollment/course-enrollment.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    ClientModule,
    ServicesModule,
    UserModule,
    CourseModule,
    ClassModule,
    CourseEnrollmentModule,
  ],
  controllers: [ClientController, UserController, CourseEnrollmentController],
  providers: [
    ClientService,
    UserService,
    {
      provide: APP_GUARD,
      useClass: ClientStatusGuard,
    },
    CourseEnrollmentService,
  ],
})
export class AppModule {}
