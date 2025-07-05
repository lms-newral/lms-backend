import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { RequestEnrollmentService } from './request-enrollment.service';

@Controller('request-enrollment')
export class RequestEnrollmentController {
  constructor(private RequestEnrollmentService: RequestEnrollmentService) {}
  @Get()
  requestEnrollmenmt() {
    return this.RequestEnrollmentService.getPendingRequests();
  }
  @Put('/accept/:requestId')
  acceptRequest(@Param('requestId') requestId: string) {
    return this.RequestEnrollmentService.acceptRequest(requestId);
  }
  @Delete('/reject/:requestId')
  rejectRequest(@Param('requestId') requestId: string) {
    return this.RequestEnrollmentService.deleteRequest(requestId);
  }
  @Post()
  createRequest(@Body() dto: { studentId: string; courseId: string }) {
    return this.RequestEnrollmentService.postRequest(dto);
  }
}
