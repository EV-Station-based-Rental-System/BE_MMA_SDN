import { OmitType, PartialType } from "@nestjs/swagger";
import { CreateStaffAtStationDto } from "./create-staff_at_station.dto";

export class UpdateStaffAtStationDto extends PartialType(OmitType(CreateStaffAtStationDto, ['staff_id', 'station_id'] as const)) { }
