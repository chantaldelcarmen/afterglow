// optional fields in db not set by serverside
import { IsOptional, IsString } from 'class-validator';

export class AttachFragmentDto {
  @IsOptional()
  @IsString()
  caption?: string;
  @IsOptional()
  @IsString() 
  text_context?: string;
}
