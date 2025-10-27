import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDateString, IsEnum, IsMongoId, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";
import { RentalStatus } from "src/common/enums/rental.enum";

export class CreateRentalDto {
  @ApiProperty({ description: "Booking id", example: "64f1c2a7e5a9b2d4f8e1a2c0" })
  @IsMongoId()
  booking_id!: string;

  @ApiProperty({ description: "Vehicle id", example: "64f1c2a7e5a9b2d4f8e1a2c1" })
  @IsMongoId()
  vehicle_id!: string;

  @ApiProperty({ description: "Pickup datetime", example: "2025-10-20T08:00:00.000Z" })
  @IsDateString()
  pickup_datetime!: string;

  @ApiPropertyOptional({ description: "Expected return datetime", example: "2025-10-22T08:00:00.000Z" })
  @IsOptional()
  @IsDateString()
  expected_return_datetime?: string;

  @ApiPropertyOptional({ description: "Actual return datetime", example: "2025-10-22T07:30:00.000Z" })
  @IsOptional()
  @IsDateString()
  actual_return_datetime?: string;

  @ApiProperty({ enum: RentalStatus, default: RentalStatus.RESERVED })
  @IsOptional()
  @IsEnum(RentalStatus)
  status: RentalStatus = RentalStatus.RESERVED;

  @ApiPropertyOptional({ description: "Customer score (0-5)", example: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  score?: number;

  @ApiPropertyOptional({ description: "Customer comment", example: "Great experience" })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiPropertyOptional({ description: "Rated at timestamp", example: "2025-10-23T09:00:00.000Z" })
  @IsOptional()
  @IsDateString()
  rated_at?: string;
}
