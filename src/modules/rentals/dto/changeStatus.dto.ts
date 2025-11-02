import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";
import { VehicleStatus } from "src/common/enums/vehicle.enum";

export class ChangeVehicleStatusDto {
  @ApiProperty({
    description: "Trạng thái mới của thuê xe",
    enum: VehicleStatus,
    example: VehicleStatus.AVAILABLE || VehicleStatus.BOOKED || VehicleStatus.MAINTAIN || VehicleStatus.PENDING,
  })
  @IsEnum(VehicleStatus)
  status: VehicleStatus;
}
