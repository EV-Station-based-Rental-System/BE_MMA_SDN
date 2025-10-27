import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { UpdateUserDto } from "./manage-user.dto";

export class UpdateStaffDto extends UpdateUserDto {
  @ApiProperty({ description: "Position of staff", example: "Manager", required: false })
  @IsString()
  position?: string;
}
