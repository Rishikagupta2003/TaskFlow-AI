import { IsString, IsNotEmpty, MinLength, MaxLength, IsOptional, IsInt, Min, Max, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class GenerateDraftsDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5, { message: 'Project objective must be at least 5 characters long' })
  @MaxLength(500, { message: 'Project objective must not exceed 500 characters' })
  projectObjective!: string;

  @IsOptional()
  @IsUUID('4', { message: 'projectId must be a valid UUID v4' })
  projectId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  maxDrafts?: number;
}
