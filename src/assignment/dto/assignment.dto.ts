import { IsNotEmpty, IsString } from 'class-validator';

export class createAssignmentDto {
  @IsString()
  @IsNotEmpty()
  assignment: string;
}
