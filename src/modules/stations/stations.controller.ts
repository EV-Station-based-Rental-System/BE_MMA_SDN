import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiExtraModels, ApiOkResponse, ApiQuery } from "@nestjs/swagger";
import { StationService } from "./stations.service";
import { CreateStationDto } from "./dto/create-station.dto";
import { UpdateStationDto } from "./dto/update-station.dto";
import { JwtAuthGuard } from "src/common/guards/jwt.guard";
import { Role } from "src/common/enums/role.enum";
import { Roles } from "src/common/decorator/roles.decorator";
import { RolesGuard } from "src/common/guards/roles.guard";
import { StationPaginationDto } from "src/common/pagination/dto/station/station-pagination.dto";
import { ApiErrorResponses } from "src/common/decorator/swagger.decorator";
import { ResponseMsg } from "src/common/response/response-message";
import { SwaggerResponseDetailDto, SwaggerResponseListDto } from "src/common/response/swagger-generic.dto";
import { Station } from "src/models/station.schema";

@ApiExtraModels(Station)
@Controller("station")
export class StationController {
  constructor(private readonly stationService: StationService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiCreatedResponse({ description: "Station created", type: SwaggerResponseDetailDto(Station) })
  @ApiErrorResponses()
  @ApiBody({ type: CreateStationDto })
  create(@Body() createStationDto: CreateStationDto) {
    return this.stationService.create(createStationDto);
  }

  @Get()
  @ApiOkResponse({ description: "List of stations", type: SwaggerResponseListDto(Station) })
  @ApiErrorResponses()
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "take", required: false, type: Number, example: 10 })
  findAll(@Query() query: StationPaginationDto) {
    const { page = 1, take = 10, ...restFilters } = query;
    return this.stationService.findAll({ page, take: Math.min(take, 100), ...restFilters });
  }

  @Get(":id")
  @ApiOkResponse({ description: "Station details", type: SwaggerResponseDetailDto(Station) })
  @ApiErrorResponses()
  findOne(@Param("id") id: string) {
    return this.stationService.findOne(id);
  }

  // @Get("all-vehicles-by-station/:id")
  // @ApiOkResponse({ description: "All vehicles by station", type: SwaggerResponseListDto(Vehicle) })
  // @ApiErrorResponses()
  // getAllVehiclesByStation(@Param("id") id: string) {
  //   // return this.stationService.getAllVehiclesByStation(id);
  // }

  @Put(":id")
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOkResponse({ description: "Station updated", type: SwaggerResponseDetailDto(Station) })
  @ApiErrorResponses()
  @ApiBody({ type: UpdateStationDto })
  update(@Param("id") id: string, @Body() updateStationDto: UpdateStationDto) {
    return this.stationService.update(id, updateStationDto);
  }

  @Patch("restore/:id")
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: "Station restored", type: ResponseMsg })
  @ApiErrorResponses()
  restore(@Param("id") id: string) {
    return this.stationService.restore(id);
  }
  @Patch("soft-delete/:id")
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: "Station removed", type: ResponseMsg })
  @ApiErrorResponses()
  softDelete(@Param("id") id: string) {
    return this.stationService.softDelete(id);
  }

  @Delete(":id")
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: "Station removed", type: ResponseMsg })
  @ApiErrorResponses()
  hardDelete(@Param("id") id: string) {
    return this.stationService.hardDelete(id);
  }
}
