import { IsNotEmpty, IsString } from 'class-validator';

export class createClassDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  description?: string;
  videoLink?: string;
  zoomLink?: string;
  attachments?: string;
  isLive?: boolean;
  isRecorded?: boolean;
  isActive?: boolean;
  scheduledAt?: number;
  attendanceCount?: number;
}
export class updateClassDto {
  title?: string;
  description?: string;
  videoLink?: string;
  zoomLink?: string;
  attachments?: string;
  isLive?: boolean;
  isRecorded?: boolean;
  isActive?: boolean;
  scheduledAt?: number;
  attendanceCount?: number;
}
