import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class PresignFileDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsNumber()
  @Min(1)
  @Max(5 * 1024 * 1024) // 5 MB
  size: number;
}

export class PresignRequestDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PresignFileDto)
  files: PresignFileDto[];
}
