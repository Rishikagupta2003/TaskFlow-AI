import { IsString, IsNotEmpty, MinLength, MaxLength, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SummarizeProjectDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Project name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Project name must not exceed 100 characters' })
  projectName!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  completedCount!: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  pendingCount!: number;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Milestone notes must not exceed 500 characters' })
  milestoneNotes?: string;
}
