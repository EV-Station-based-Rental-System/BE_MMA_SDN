import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query, UseGuards } from "@nestjs/common";
import { VehicleService } from "./vehicles.service";
import { CreateVehicleDto } from "./dto/create-vehicle.dto";
import { UpdateVehicleDto } from "./dto/update-vehicle.dto";
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiExtraModels, ApiOkResponse, ApiQuery } from "@nestjs/swagger";
import { Role } from "src/common/enums/role.enum";
import { VehiclePaginationDto } from "src/common/pagination/dto/vehicle/vehicle-pagination.dto";
import { ApiErrorResponses } from "src/common/decorator/swagger.decorator";
import { Roles } from "src/common/decorator/roles.decorator";
import { ResponseMsg } from "src/common/response/response-message";
import { Vehicle } from "src/models/vehicle.schema";
import { SwaggerResponseDetailDto, SwaggerResponseListDto } from "src/common/response/swagger-generic.dto";
import { JwtAuthGuard } from "src/common/guards/jwt.guard";
import { RolesGuard } from "src/common/guards/roles.guard";

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@ApiExtraModels(Vehicle)
@Controller("vehicle")
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Post()
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiBody({ type: CreateVehicleDto })
  @ApiCreatedResponse({ description: "Vehicle created", type: SwaggerResponseDetailDto(Vehicle) })
  @ApiErrorResponses()
  create(@Body() createVehicleDto: CreateVehicleDto) {
    return this.vehicleService.create(createVehicleDto);
  }

  @Get()
  @ApiOkResponse({ description: "List of vehicles", type: SwaggerResponseListDto(Vehicle) })
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
  @ApiOkResponse({ description: "Vehicle details", type: SwaggerResponseDetailDto(Vehicle) })
  @ApiErrorResponses()
  findOne(@Param("id") id: string) {
    return this.vehicleService.findOne(id);
  }

  @Roles(Role.ADMIN, Role.STAFF)
  @Put(":id")
  @ApiOkResponse({ description: "Vehicle updated", type: SwaggerResponseDetailDto(Vehicle) })
  @ApiBody({ type: UpdateVehicleDto })
  @ApiErrorResponses()
  update(@Param("id") id: string, @Body() updateVehicleDto: UpdateVehicleDto) {
    return this.vehicleService.update(id, updateVehicleDto);
  }

  @Roles(Role.ADMIN)
  @ApiOkResponse({ description: "Vehicle soft-deleted", type: ResponseMsg })
  @ApiErrorResponses()
  @Patch("soft-delete/:id")
  softDelete(@Param("id") id: string) {
    return this.vehicleService.softDelete(id);
  }

  @Roles(Role.ADMIN)
  @Delete(":id")
  @ApiOkResponse({ description: "Vehicle hard-deleted", type: ResponseMsg })
  @ApiErrorResponses()
  hardDelete(@Param("id") id: string) {
    return this.vehicleService.hardDelete(id);
  }
}
