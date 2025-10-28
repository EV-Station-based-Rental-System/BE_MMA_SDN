import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { UpdateUserDto } from "./user.dto";

export class UpdateStaffDto extends UpdateUserDto {
  @ApiProperty({ description: "Position of staff", example: "Manager", required: false })
  @IsString()
  position?: string;

  @ApiProperty({ description: "Station ID where the staff is assigned", example: "652ab5678f1e8b0012abcd78", required: false })
  @IsString()
  station_id?: string;
}
