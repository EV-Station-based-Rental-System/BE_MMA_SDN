import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Put } from "@nestjs/common";
import { VehicleStationService } from "./vehicle_station.service";
import { CreateVehicleStationDto } from "./dto/create-vehicle_station.dto";
import { UpdateVehicleStationDto } from "./dto/update-vehicle_station.dto";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { Roles } from "src/common/decorator/roles.decorator";
import { Role } from "src/common/enums/role.enum";
import { JwtAuthGuard } from "src/common/guards/jwt.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { ResponseDetail } from "src/common/response/response-detail-create-update";
import { ResponseBadRequest } from "src/common/response/error/response-bad-request";
import { ResponseConflict } from "src/common/response/error/response-conflict";
import { ResponseForbidden } from "src/common/response/error/response-forbidden";
import { ResponseInternalError } from "src/common/response/error/response-internal-error";
import { ResponseUnauthorized } from "src/common/response/error/response-unauthorized";
import { ResponseList } from "src/common/response/response-list";
import { ChangeStatusDto } from "./dto/changeStatus.dto";
import { VehicleAtStationPaginationDto } from "src/common/pagination/dto/vehicle_at_station/vehicle_at_station-pagination";

@Controller("vehicle-station")
@ApiBearerAuth()
export class VehicleStationController {
  constructor(private readonly vehicleStationService: VehicleStationService) {}

  @Post()
  @Roles(Role.ADMIN, Role.STAFF)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiCreatedResponse({ description: "Create vehicle at station", type: ResponseDetail })
  @ApiBadRequestResponse({ description: "Invalid payload", type: ResponseBadRequest })
  @ApiUnauthorizedResponse({ description: "Unauthorized", type: ResponseUnauthorized })
  @ApiForbiddenResponse({ description: "Forbidden", type: ResponseForbidden })
  @ApiConflictResponse({ description: "Vehicle already exists", type: ResponseConflict })
  @ApiInternalServerErrorResponse({ description: "Server error", type: ResponseInternalError })
  create(@Body() createVehicleStationDto: CreateVehicleStationDto) {
    return this.vehicleStationService.create(createVehicleStationDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.STAFF)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: "Get all vehicles at all stations" })
  @ApiOkResponse({ description: "List of vehicles at all stations", type: ResponseList })
  @ApiBadRequestResponse({ description: "Invalid query", type: ResponseBadRequest })
  @ApiUnauthorizedResponse({ description: "Unauthorized", type: ResponseUnauthorized })
  @ApiForbiddenResponse({ description: "Forbidden", type: ResponseForbidden })
  @ApiInternalServerErrorResponse({ description: "Server error", type: ResponseInternalError })
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "take", required: false, type: Number, example: 10 })
  findAll(@Query() query: VehicleAtStationPaginationDto) {
    const { page = 1, take = 10, ...restFilters } = query;
    return this.vehicleStationService.findAll({
      page,
      take: Math.min(take, 100),
      ...restFilters,
    });
  }

  @Get(":id")
  @Roles(Role.ADMIN, Role.STAFF)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: "Get vehicle at station by ID" })
  @ApiOkResponse({ description: "Vehicle at station found", type: ResponseDetail })
  @ApiBadRequestResponse({ description: "Invalid ID format", type: ResponseBadRequest })
  @ApiUnauthorizedResponse({ description: "Unauthorized", type: ResponseUnauthorized })
  @ApiForbiddenResponse({ description: "Forbidden", type: ResponseForbidden })
  @ApiInternalServerErrorResponse({ description: "Server error", type: ResponseInternalError })
  findOne(@Param("id") id: string) {
    return this.vehicleStationService.findOne(id);
  }

  @Put(":id")
  @Roles(Role.ADMIN, Role.STAFF)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: "Change status of vehicle at station" })
  @ApiOkResponse({ description: "Vehicle status changed successfully", type: ResponseDetail })
  @ApiBadRequestResponse({ description: "Invalid payload", type: ResponseBadRequest })
  @ApiUnauthorizedResponse({ description: "Unauthorized", type: ResponseUnauthorized })
  @ApiForbiddenResponse({ description: "Forbidden", type: ResponseForbidden })
  @ApiInternalServerErrorResponse({ description: "Server error", type: ResponseInternalError })
  update(@Param("id") id: string, @Body() updateVehicleStationDto: UpdateVehicleStationDto) {
    return this.vehicleStationService.update(id, updateVehicleStationDto);
  }

  @Patch("changeStatus/:id")
  @ApiOperation({ summary: "Change status of vehicle at station" })
  @ApiOkResponse({ description: "Vehicle status changed successfully", type: ResponseDetail })
  @ApiBadRequestResponse({ description: "Invalid payload", type: ResponseBadRequest })
  @ApiUnauthorizedResponse({ description: "Unauthorized", type: ResponseUnauthorized })
  @ApiForbiddenResponse({ description: "Forbidden", type: ResponseForbidden })
  @ApiInternalServerErrorResponse({ description: "Server error", type: ResponseInternalError })
  changeStatus(@Param("id") id: string, @Body() body: ChangeStatusDto) {
    return this.vehicleStationService.changeStatus(id, body);
  }

  @Delete(":id")
  @Roles(Role.ADMIN, Role.STAFF)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: "Delete vehicle at station by ID" })
  @ApiOkResponse({ description: "Vehicle at station deleted successfully" })
  @ApiBadRequestResponse({ description: "Invalid ID format", type: ResponseBadRequest })
  @ApiUnauthorizedResponse({ description: "Unauthorized", type: ResponseUnauthorized })
  @ApiForbiddenResponse({ description: "Forbidden", type: ResponseForbidden })
  @ApiInternalServerErrorResponse({ description: "Server error", type: ResponseInternalError })
  remove(@Param("id") id: string) {
    return this.vehicleStationService.remove(+id);
  }
}
