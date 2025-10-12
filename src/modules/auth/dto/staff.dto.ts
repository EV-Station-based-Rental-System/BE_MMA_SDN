import { ApiProperty } from "@nestjs/swagger";
import { UserDto } from "./user.dto";
import { IsString, IsNotEmpty } from "class-validator";

export class StaffDto extends UserDto {
  @ApiProperty({ example: "Staff", description: "" })
  @IsString()
  @IsNotEmpty()
  position: string;
}
