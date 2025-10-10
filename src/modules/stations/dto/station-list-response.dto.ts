import { ApiExtraModels } from "@nestjs/swagger";
import { createPaginatedResponseDto } from "src/common/dto/paginated-response.dto";
import { StationResponseDto } from "./station-response.dto";

@ApiExtraModels(StationResponseDto)
export class StationListResponseDto extends createPaginatedResponseDto(StationResponseDto) {}
