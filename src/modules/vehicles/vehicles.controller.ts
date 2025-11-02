import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query, UseGuards } from "@nestjs/common";
import { VehicleService } from "./vehicles.service";
import { CreateVehicleDto } from "./dto/create-vehicle.dto";
import { UpdateVehicleDto } from "./dto/update-vehicle.dto";
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOkResponse, ApiQuery } from "@nestjs/swagger";
import { Role } from "src/common/enums/role.enum";
import { VehiclePaginationDto } from "src/common/pagination/dto/vehicle/vehicle-pagination.dto";
import { ApiErrorResponses } from "src/common/decorator/swagger.decorator";
import { Roles } from "src/common/decorator/roles.decorator";
import { ResponseMsg } from "src/common/response/response-message";
import { Vehicle } from "src/models/vehicle.schema";
import { SwaggerResponseDetailDto } from "src/common/response/swagger-generic.dto";
import { JwtAuthGuard } from "src/common/guards/jwt.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
// import { VehicleWithPricingAndStation } from "./dto/get-vehicle-respone.dto";
// import { CreateVehicleWithStationAndPricingDto } from "./dto/create-vehicle-with-station-pricing.dto";

// @ApiExtraModels(Vehicle, VehicleWithPricingAndStation)
@Controller("vehicle")
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiCreatedResponse({ description: "Vehicle created", type: SwaggerResponseDetailDto(Vehicle) })
  @ApiErrorResponses()
  @ApiBody({ type: CreateVehicleDto })
  create(@Body() createVehicleDto: CreateVehicleDto) {
    return this.vehicleService.create(createVehicleDto);
  }

  // @Post("with-station-and-pricing")
  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.ADMIN, Role.STAFF)
  // @ApiCreatedResponse({
  //   description: "Vehicle created with pricing for an existing station",
  //   type: SwaggerResponseDetailDto(VehicleWithPricingAndStation),
  // })
  // @ApiErrorResponses()
  // @ApiBody({ type: CreateVehicleWithStationAndPricingDto })
  // createWithStationAndPricing(@Body() createDto: CreateVehicleWithStationAndPricingDto) {
  //   return this.vehicleService.createWithStationAndPricing(createDto);
  // }

  @Get()
  // @ApiOkResponse({ description: "List of vehicles", type: SwaggerResponseListDto(VehicleWithPricingAndStation) })
  @ApiErrorResponses()
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "take", required: false, type: Number, example: 10 })
  findAll(@Query() query: VehiclePaginationDto) {
    const { page = 1, take = 10, ...restFilters } = query;
    return this.vehicleService.findAll({
      page,
      take: Math.min(take, 100),
      ...restFilters,
    });
  }

  @Get(":id")
  // @ApiOkResponse({ description: "Vehicle details", type: SwaggerResponseDetailDto(VehicleWithPricingAndStation) })
  @ApiErrorResponses()
  findOne(@Param("id") id: string) {
    return this.vehicleService.findOne(id);
  }

  @Put(":id")
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.STAFF)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOkResponse({ description: "Vehicle updated", type: SwaggerResponseDetailDto(Vehicle) })
  @ApiErrorResponses()
  @ApiBody({ type: UpdateVehicleDto })
  update(@Param("id") id: string, @Body() updateVehicleDto: UpdateVehicleDto) {
    return this.vehicleService.update(id, updateVehicleDto);
  }

  @Patch("soft-delete/:id")
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: "Vehicle soft-deleted", type: ResponseMsg })
  @ApiErrorResponses()
  softDelete(@Param("id") id: string) {
    return this.vehicleService.softDelete(id);
  }

  @Delete(":id")
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: "Vehicle hard-deleted", type: ResponseMsg })
  @ApiErrorResponses()
  hardDelete(@Param("id") id: string) {
    return this.vehicleService.hardDelete(id);
  }
}
