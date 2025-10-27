import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class CancelBookingDto {
  @ApiPropertyOptional({ description: "Reason provided by renter", example: "Plans changed" })
  @IsOptional()
  @IsString()
  reason?: string;
}
