import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

import { StatusVehicleAtStation } from 'src/common/enums/vehicle_at_station.enum';

export class ChangeStatusDto {
  @ApiProperty({
    description: 'Update status of vehicle at station',
    enum: StatusVehicleAtStation,
    example: StatusVehicleAtStation.AVAILABLE,
  })
  @IsEnum(StatusVehicleAtStation, { message: 'Status must be a valid enum value' })
  status: StatusVehicleAtStation;
}
