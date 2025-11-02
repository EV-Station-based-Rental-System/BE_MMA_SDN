import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";
import { VehicleStatus } from "src/common/enums/vehicle.enum";

export class ChangeStatusVehicleDto {
  @ApiProperty({ description: "New status of the vehicle", example: "AVAILABLE" })
  @IsEnum(VehicleStatus)
  status: VehicleStatus;
}
