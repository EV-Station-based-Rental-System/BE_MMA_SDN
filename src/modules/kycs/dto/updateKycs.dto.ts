import { OmitType, PartialType } from "@nestjs/swagger";
import { CreateKycsDto } from "./createKycs.dto";

export class UpdateKycsDto extends PartialType(OmitType(CreateKycsDto, ["renter_id"] as const)) {}
