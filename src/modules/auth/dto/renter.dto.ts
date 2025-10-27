import { IsString, IsDateString, IsOptional } from "class-validator";
import { UserDto } from "./auth-user.dto";
import { ApiProperty } from "@nestjs/swagger";

export class RenterDto extends UserDto {
  @ApiProperty({
    description: "Driver license number of the renter (optional)",
    example: "123456789",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "Driver license number must be a string" })
  driver_license_no?: string;

  @ApiProperty({
    description: "Address of the renter (optional)",
    example: "123 FPT",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "Address must be a string" })
  address?: string;

  @ApiProperty({
    description: "Date of birth of the renter (ISO 8601 format)",
    example: "1990-01-01",
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: "Date of birth must be a valid date (ISO 8601)" })
  date_of_birth?: string;
}
