import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEmail()
  assigneeEmail: string;

  @IsOptional()
  @IsString()
  assigneeId?: string;
}