import { IsString, IsOptional, IsBoolean, IsArray, Matches } from 'class-validator';

export class CreatePageDto {
  @IsString()
  @Matches(/^[a-z0-9-]+$/)
  slug: string;

  @IsString()
  title: string;

  @IsArray()
  @IsOptional()
  blocks?: any[];

  @IsBoolean()
  @IsOptional()
  isHome?: boolean;
}

export class UpdatePageDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsArray()
  @IsOptional()
  blocks?: any[];

  @IsBoolean()
  @IsOptional()
  isHome?: boolean;
}
