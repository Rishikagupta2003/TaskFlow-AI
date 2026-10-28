import { IsOptional, IsString, MaxLength, IsUrl, IsObject } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayName?: string;

  @IsOptional()
  @IsString()
  @IsUrl({ require_tld: false }, { message: 'avatarUrl must be a valid URL' })
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @IsOptional()
  @IsObject()
  preferences?: Record<string, unknown>;
}
