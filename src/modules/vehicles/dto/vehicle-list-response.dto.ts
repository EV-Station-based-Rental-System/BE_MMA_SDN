import { ApiExtraModels } from "@nestjs/swagger";
import { createPaginatedResponseDto } from "src/common/dto/paginated-response.dto";
import { VehicleResponseDto } from "./vehicle-response.dto";

@ApiExtraModels(VehicleResponseDto)
export class VehicleListResponseDto extends createPaginatedResponseDto(VehicleResponseDto) {}
