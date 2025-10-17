import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiExtraModels, ApiOkResponse, ApiQuery } from "@nestjs/swagger";
import { VehicleStationService } from "./vehicle_station.service";
import { CreateVehicleStationDto } from "./dto/create-vehicle_station.dto";
import { UpdateVehicleStationDto } from "./dto/update-vehicle_station.dto";
import { Roles } from "src/common/decorator/roles.decorator";
import { Role } from "src/common/enums/role.enum";
import { JwtAuthGuard } from "src/common/guards/jwt.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { ApiErrorResponses } from "src/common/decorator/swagger.decorator";
import { ResponseMsg } from "src/common/response/response-message";
import { ChangeStatusDto } from "./dto/changeStatus.dto";
import { VehicleAtStation } from "src/models/vehicle_at_station.schema";
import { VehicleAtStationPaginationDto } from "src/common/pagination/dto/vehicle_at_station/vehicle_at_station-pagination";
import { SwaggerResponseDetailDto, SwaggerResponseListDto } from "src/common/response/swagger-generic.dto";

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@ApiExtraModels(VehicleAtStation)
@Controller("vehicle-station")
export class VehicleStationController {
  constructor(private readonly vehicleStationService: VehicleStationService) {}

  @Post()
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiCreatedResponse({ description: "Create vehicle at station", type: SwaggerResponseDetailDto(VehicleAtStation) })
  @ApiErrorResponses()
  @ApiBody({ type: CreateVehicleStationDto })
  create(@Body() createVehicleStationDto: CreateVehicleStationDto) {
    return this.vehicleStationService.create(createVehicleStationDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiOkResponse({ description: "List of vehicles at all stations", type: SwaggerResponseListDto(VehicleAtStation) })
  @ApiErrorResponses()
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
  @ApiOkResponse({ description: "Vehicle at station found", type: SwaggerResponseDetailDto(VehicleAtStation) })
  @ApiErrorResponses()
  findOne(@Param("id") id: string) {
    return this.vehicleStationService.findOne(id);
  }

  @Put(":id")
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiOkResponse({ description: "Vehicle status changed successfully", type: SwaggerResponseDetailDto(VehicleAtStation) })
  @ApiErrorResponses()
  @ApiBody({ type: UpdateVehicleStationDto })
  update(@Param("id") id: string, @Body() updateVehicleStationDto: UpdateVehicleStationDto) {
    return this.vehicleStationService.update(id, updateVehicleStationDto);
  }

  @Patch("changeStatus/:id")
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiOkResponse({ description: "Vehicle status changed successfully", type: SwaggerResponseDetailDto(VehicleAtStation) })
  @ApiErrorResponses()
  @ApiBody({ type: ChangeStatusDto })
  changeStatus(@Param("id") id: string, @Body() body: ChangeStatusDto) {
    return this.vehicleStationService.changeStatus(id, body);
  }

  @Delete(":id")
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiOkResponse({ description: "Vehicle at station deleted successfully", type: ResponseMsg })
  @ApiErrorResponses()
  remove(@Param("id") id: string) {
    return this.vehicleStationService.remove(id);
  }
}
