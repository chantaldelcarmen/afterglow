// optional fields in db not set by serverside
import { IsIn, IsOptional, IsString } from 'class-validator';

export class AttachFragmentDto {
  @IsOptional()
  @IsString()
  caption?: string;

  @IsOptional()
  @IsString()
  text_context?: string;

  @IsOptional()
  @IsString()
  @IsIn(['text'])
  type?: 'text';
}
