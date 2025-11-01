import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional } from "class-validator";

export class UpdateUserDto {
  @ApiProperty({ description: "Full name of user", example: "Nguyen Van A", required: false })
  @IsOptional()
  @IsString()
  full_name?: string;

  @ApiProperty({ description: "Phone number", example: "0901234567", required: false })
  @IsOptional()
  @IsString()
  phone?: string;
}
