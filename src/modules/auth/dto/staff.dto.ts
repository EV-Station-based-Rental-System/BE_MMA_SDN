import { ApiProperty } from "@nestjs/swagger";
import { UserDto } from "./user.dto";
import { IsString, IsNotEmpty } from "class-validator";

export class StaffDto extends UserDto {
  @ApiProperty({ example: "Staff", description: "" })
  @IsString()
  @IsNotEmpty()
  position: string;

  @ApiProperty({ example: "station_id", description: "Station ID (ObjectId as string)" })
  @IsString()
  @IsNotEmpty()
  station_id: string;
}
