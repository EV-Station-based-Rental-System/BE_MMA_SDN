import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { Roles } from "src/common/decorators/roles.decorator";
import { ErrorResponseDto } from "src/common/dto/error-response.dto";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { Role } from "src/common/enums/role.enum";
import { JwtAuthGuard } from "src/common/guards/jwt.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { MessageResponseDto } from "src/modules/auth/dto/message-response.dto";
import { CreateStationDto } from "./dto/create-station.dto";
import { StationListResponseDto } from "./dto/station-list-response.dto";
import { StationResponseDto } from "./dto/station-response.dto";
import { UpdateStationDto } from "./dto/update-station.dto";
import { StationsService } from "./stations.service";

@ApiTags("stations")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller("stations")
export class StationsController {
  constructor(private readonly stationsService: StationsService) {}

  @Post()
  @ApiCreatedResponse({ description: "Station created", type: StationResponseDto })
  @ApiBadRequestResponse({ description: "Invalid payload", type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ description: "Unauthorized", type: ErrorResponseDto })
  @ApiForbiddenResponse({ description: "Forbidden", type: ErrorResponseDto })
  @ApiConflictResponse({ description: "Station already exists", type: ErrorResponseDto })
  @ApiInternalServerErrorResponse({ description: "Server error", type: ErrorResponseDto })
  create(@Body() createStationDto: CreateStationDto) {
    return this.stationsService.create(createStationDto);
  }

  @Get()
  @ApiOkResponse({ description: "List of stations", type: StationListResponseDto })
  @ApiBadRequestResponse({ description: "Invalid pagination", type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ description: "Unauthorized", type: ErrorResponseDto })
  @ApiForbiddenResponse({ description: "Forbidden", type: ErrorResponseDto })
  @ApiInternalServerErrorResponse({ description: "Server error", type: ErrorResponseDto })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.stationsService.findAll(paginationDto);
  }

  @Get(":id")
  @ApiOkResponse({ description: "Station details", type: StationResponseDto })
  @ApiBadRequestResponse({ description: "Invalid station id", type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ description: "Unauthorized", type: ErrorResponseDto })
  @ApiForbiddenResponse({ description: "Forbidden", type: ErrorResponseDto })
  @ApiNotFoundResponse({ description: "Station not found", type: ErrorResponseDto })
  @ApiInternalServerErrorResponse({ description: "Server error", type: ErrorResponseDto })
  findOne(@Param("id") id: string) {
    return this.stationsService.findOne(id);
  }

  @Patch(":id")
  @ApiOkResponse({ description: "Station updated", type: StationResponseDto })
  @ApiBadRequestResponse({ description: "Invalid payload", type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ description: "Unauthorized", type: ErrorResponseDto })
  @ApiForbiddenResponse({ description: "Forbidden", type: ErrorResponseDto })
  @ApiNotFoundResponse({ description: "Station not found", type: ErrorResponseDto })
  @ApiConflictResponse({ description: "Station already exists", type: ErrorResponseDto })
  @ApiInternalServerErrorResponse({ description: "Server error", type: ErrorResponseDto })
  update(@Param("id") id: string, @Body() updateStationDto: UpdateStationDto) {
    return this.stationsService.update(id, updateStationDto);
  }

  @Delete(":id")
  @ApiOkResponse({ description: "Station removed", type: MessageResponseDto })
  @ApiBadRequestResponse({ description: "Invalid station id", type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ description: "Unauthorized", type: ErrorResponseDto })
  @ApiForbiddenResponse({ description: "Forbidden", type: ErrorResponseDto })
  @ApiNotFoundResponse({ description: "Station not found", type: ErrorResponseDto })
  @ApiInternalServerErrorResponse({ description: "Server error", type: ErrorResponseDto })
  remove(@Param("id") id: string): Promise<MessageResponseDto> {
    return this.stationsService.remove(id);
  }
}
