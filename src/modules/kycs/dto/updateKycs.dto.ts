import { PartialType } from "@nestjs/swagger";
import { CreateKycsDto } from "./createKycs.dto";

export class UpdateKycsDto extends PartialType(CreateKycsDto) {}
