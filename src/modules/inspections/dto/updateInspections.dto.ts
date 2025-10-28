import { PartialType } from "@nestjs/swagger";
import { CreateInspectionDto } from "./createInspections.dto";

export class UpdateInspectionDto extends PartialType(CreateInspectionDto) {}
