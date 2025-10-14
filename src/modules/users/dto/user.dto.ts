import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class UpdateUserDto {
  @ApiProperty({ description: "Full name of user", example: "Nguyen Van A", required: false })
  @IsString()
  full_name?: string;

  @ApiProperty({ description: "Phone number", example: "0901234567", required: false })
  @IsString()
  phone?: string;
}
