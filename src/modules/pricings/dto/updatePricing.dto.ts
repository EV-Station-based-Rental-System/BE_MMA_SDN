import { PartialType } from "@nestjs/swagger";
import { CreatePricingDto } from "./createPricing.dto";

export class UpdatePricingDto extends PartialType(CreatePricingDto) {}
