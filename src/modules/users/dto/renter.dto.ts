import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsDateString, IsOptional } from "class-validator";
import { UpdateUserDto } from "./user.dto";

export class UpdateRenterDto extends UpdateUserDto {
  @ApiPropertyOptional({ description: "Driver license number", example: "AB123456", required: false })
  @IsOptional()
  @IsString()
  driver_license_no?: string;

  @ApiPropertyOptional({ description: "Address", example: "123 Le Loi, HCM", required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: "Date of birth", example: "1990-01-01", required: false })
  @IsOptional()
  @IsDateString()
  date_of_birth?: Date;
}
