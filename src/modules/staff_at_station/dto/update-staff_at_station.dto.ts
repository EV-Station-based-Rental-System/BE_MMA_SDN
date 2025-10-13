import { PartialType } from "@nestjs/swagger";
import { CreateStaffAtStationDto } from "./create-staff_at_station.dto";

export class UpdateStaffAtStationDto extends PartialType(CreateStaffAtStationDto) {}
