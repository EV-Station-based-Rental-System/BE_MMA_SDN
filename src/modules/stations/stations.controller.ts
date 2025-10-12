import { Controller, Get, Post, Body, Patch, Param, Delete, Put, UseGuards, Query } from "@nestjs/common";
import { StationService } from "./stations.service";
import { CreateStationDto } from "./dto/create-station.dto";
import { UpdateStationDto } from "./dto/update-station.dto";
import { JwtAuthGuard } from "src/common/guards/jwt.guard";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { Role } from "src/common/enums/role.enum";
import { Roles } from "src/common/decorator/roles.decorator";
import { RolesGuard } from "src/common/guards/roles.guard";
import { StationPaginationDto } from "src/common/pagination/dto/station/station-pagination.dto";
import { ResponseBadRequest } from "src/common/response/error/response-bad-request";
import { ResponseUnauthorized } from "src/common/response/error/response-unauthorized";
import { ResponseForbidden } from "src/common/response/error/response-forbidden";
import { ResponseConflict } from "src/common/response/error/response-conflict";
import { ResponseInternalError } from "src/common/response/error/response-internal-error";
import { ResponseDetail } from "src/common/response/response-detail-create-update";

import { ResponseList } from "src/common/response/response-list";
import { ResponseNotFound } from "src/common/response/error/response-notfound";
import { ResponseMsg } from "src/common/response/response-message";

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Controller("station")
export class StationController {
  constructor(private readonly stationService: StationService) {}

  @Roles(Role.ADMIN)
  @Post()
  @ApiCreatedResponse({ description: "Station created", type: ResponseDetail })
  @ApiBadRequestResponse({ description: "Invalid payload", type: ResponseBadRequest })
  @ApiUnauthorizedResponse({ description: "Unauthorized", type: ResponseUnauthorized })
  @ApiForbiddenResponse({ description: "Forbidden", type: ResponseForbidden })
  @ApiConflictResponse({ description: "Station already exists", type: ResponseConflict })
  @ApiInternalServerErrorResponse({ description: "Server error", type: ResponseInternalError })
  @ApiBody({ type: CreateStationDto })
  create(@Body() createStationDto: CreateStationDto) {
    return this.stationService.create(createStationDto);
  }

  @Roles(Role.ADMIN, Role.STAFF, Role.RENTER)
  @Get()
  @ApiOkResponse({ description: "List of stations", type: ResponseList })
  @ApiBadRequestResponse({ description: "Invalid payload", type: ResponseBadRequest })
  @ApiUnauthorizedResponse({ description: "Unauthorized", type: ResponseUnauthorized })
  @ApiForbiddenResponse({ description: "Forbidden", type: ResponseForbidden })
  @ApiInternalServerErrorResponse({ description: "Server error", type: ResponseInternalError })
  @ApiOperation({ summary: "Get all vehicles for admin" })
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "take", required: false, type: Number, example: 10 })
  findAll(@Query() query: StationPaginationDto) {
    const { page = 1, take = 10, ...restFilters } = query;
    return this.stationService.findAll({ page, take: Math.min(take, 100), ...restFilters });
  }

  @Roles(Role.ADMIN, Role.STAFF, Role.RENTER)
  @Get(":id")
  @ApiOkResponse({ description: "Station details", type: ResponseDetail })
  @ApiBadRequestResponse({ description: "Invalid station id", type: ResponseBadRequest })
  @ApiUnauthorizedResponse({ description: "Unauthorized", type: ResponseUnauthorized })
  @ApiForbiddenResponse({ description: "Forbidden", type: ResponseForbidden })
  @ApiNotFoundResponse({ description: "Station not found", type: ResponseNotFound })
  @ApiInternalServerErrorResponse({ description: "Server error", type: ResponseInternalError })
  findOne(@Param("id") id: string) {
    return this.stationService.findOne(id);
  }

  @Roles(Role.ADMIN)
  @Put(":id")
  @ApiOkResponse({ description: "Station updated", type: ResponseDetail })
  @ApiBadRequestResponse({ description: "Invalid payload", type: ResponseBadRequest })
  @ApiUnauthorizedResponse({ description: "Unauthorized", type: ResponseUnauthorized })
  @ApiForbiddenResponse({ description: "Forbidden", type: ResponseForbidden })
  @ApiNotFoundResponse({ description: "Station not found", type: ResponseNotFound })
  @ApiConflictResponse({ description: "Station already exists", type: ResponseConflict })
  @ApiInternalServerErrorResponse({ description: "Server error", type: ResponseInternalError })
  @ApiBody({ type: UpdateStationDto })
  update(@Param("id") id: string, @Body() updateStationDto: UpdateStationDto) {
    return this.stationService.update(id, updateStationDto);
  }

  @Roles(Role.ADMIN)
  @Patch("soft-delete/:id")
  @ApiOkResponse({ description: "Station removed", type: ResponseMsg })
  @ApiBadRequestResponse({ description: "Invalid station id", type: ResponseBadRequest })
  @ApiUnauthorizedResponse({ description: "Unauthorized", type: ResponseUnauthorized })
  @ApiForbiddenResponse({ description: "Forbidden", type: ResponseForbidden })
  @ApiNotFoundResponse({ description: "Station not found", type: ResponseNotFound })
  @ApiInternalServerErrorResponse({ description: "Server error", type: ResponseInternalError })
  softDelete(@Param("id") id: string) {
    return this.stationService.softDelete(id);
  }

  @Roles(Role.ADMIN)
  @Delete(":id")
  @ApiOkResponse({ description: "Station removed", type: ResponseMsg })
  @ApiBadRequestResponse({ description: "Invalid station id", type: ResponseBadRequest })
  @ApiUnauthorizedResponse({ description: "Unauthorized", type: ResponseUnauthorized })
  @ApiForbiddenResponse({ description: "Forbidden", type: ResponseForbidden })
  @ApiNotFoundResponse({ description: "Station not found", type: ResponseNotFound })
  @ApiInternalServerErrorResponse({ description: "Server error", type: ResponseInternalError })
  hashDelete(@Param("id") id: string) {
    return this.stationService.hashDelete(id);
  }
}
