import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsMongoId, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateReportDto {
  @ApiProperty({ description: "Related inspection identifier", example: "6714b621a2ce5b57b9e3d5f1" })
  @IsMongoId()
  inspection_id: string;

  @ApiPropertyOptional({ description: "Notes about the damage found", example: "Scratch on the left door" })
  @IsOptional()
  @IsString()
  damage_notes?: string;

  @ApiProperty({ description: "Indicates whether any damage was detected", example: true, default: false })
  @Type(() => Boolean)
  @IsBoolean()
  damage_found: boolean;

  @ApiPropertyOptional({ description: "Estimated repair price", example: 150.5, default: 0 })
  @Type(() => Number)
  @IsNumber({ allowNaN: false, allowInfinity: false })
  damage_price: number;
}
