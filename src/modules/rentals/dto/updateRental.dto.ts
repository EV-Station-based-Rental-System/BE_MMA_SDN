import { PartialType, OmitType } from "@nestjs/swagger";
import { CreateRentalDto } from "./createRental.dto";

export class UpdateRentalDto extends PartialType(OmitType(CreateRentalDto, ["booking_id", "vehicle_id"] as const)) {}
