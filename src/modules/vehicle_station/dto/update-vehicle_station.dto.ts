import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateVehicleStationDto } from './create-vehicle_station.dto';

export class UpdateVehicleStationDto extends PartialType(OmitType(CreateVehicleStationDto, ['vehicle_id', 'station_id'] as const)) {}
