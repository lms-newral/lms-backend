import { IsNotEmpty, IsString } from 'class-validator';

export class createNotesDto {
  @IsString()
  @IsNotEmpty()
  notesHtml: string;
}
