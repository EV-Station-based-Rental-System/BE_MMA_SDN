import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipeBuilder,
  HttpStatus,
} from "@nestjs/common";
import { VehicleService } from "./vehicles.service";
import { CreateVehicleDto } from "./dto/create-vehicle.dto";
import { UpdateVehicleDto } from "./dto/update-vehicle.dto";
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOkResponse, ApiQuery, ApiConsumes } from "@nestjs/swagger";
import { Role } from "src/common/enums/role.enum";
import { VehiclePaginationDto } from "src/common/pagination/dto/vehicle/vehicle-pagination.dto";
import { ApiErrorResponses } from "src/common/decorator/swagger.decorator";
import { Roles } from "src/common/decorator/roles.decorator";
import { ResponseMsg } from "src/common/response/response-message";
import { Vehicle } from "src/models/vehicle.schema";
import { SwaggerResponseDetailDto } from "src/common/response/swagger-generic.dto";
import { JwtAuthGuard } from "src/common/guards/jwt.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { FileInterceptor } from "@nestjs/platform-express";
import { ChangeStatusDto } from "../rentals/dto/changeStatus.dto";
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
  @UseInterceptors(FileInterceptor("image"))
  @ApiConsumes("multipart/form-data")
  @ApiCreatedResponse({ description: "Vehicle created", type: SwaggerResponseDetailDto(Vehicle) })
  @ApiErrorResponses()
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        make: { type: "string", example: "Tesla" },
        model: { type: "string", example: "Model 3" },
        model_year: { type: "number", example: 2025 },
        category: { type: "string", example: "EV" },
        battery_capacity_kwh: { type: "number", example: 75 },
        range_km: { type: "number", example: 500 },
        vin_number: { type: "string", example: "5YJ3E1EA7KF317XXX" },
        license_plate: { type: "string", example: "29A-12345", description: "Vehicle license plate"},
        station_id: { type: "string", example: "station_id" },
        price_per_hour: { type: "number", example: 50000 },
        price_per_day: { type: "number", example: 300000 },
        deposit_amount: { type: "number", example: 500000 },
        label: { type: "string", example: "Front view", description: "Optional image label/description" },
        image: { type: "string", format: "binary", description: "Vehicle image file (jpg, jpeg, png, gif, webp) - Max 5MB" },
      },
      required: ["make", "model", "model_year", "category", "station_id", "price_per_hour", "deposit_amount", "price_per_day", "vin_number", "license_plate"],
    },
  })
  create(
    @Body() createVehicleDto: CreateVehicleDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png|gif|webp)$/,
        })
        .addMaxSizeValidator({
          maxSize: 5 * 1024 * 1024, // 5MB
        })
        .build({
          fileIsRequired: false,
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    image?: any,
  ) {
    return this.vehicleService.create(createVehicleDto, image);
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
  @UseInterceptors(FileInterceptor("image"))
  @ApiConsumes("multipart/form-data")
  @ApiOkResponse({ description: "Vehicle updated", type: SwaggerResponseDetailDto(Vehicle) })
  @ApiErrorResponses()
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        make: { type: "string", example: "Tesla" },
        model: { type: "string", example: "Model 3" },
        model_year: { type: "number", example: 2025 },
        category: { type: "string", example: "EV" },
        battery_capacity_kwh: { type: "number", example: 75 },
        range_km: { type: "number", example: 500 },
        vin_number: { type: "string", example: "5YJ3E1EA7KF317XXX" },
        license_plate: { type: "string", example: "29A-12345", description: "Vehicle license plate" },
        station_id: { type: "string", example: "station_id" },
        price_per_hour: { type: "number", example: 50000 },
        price_per_day: { type: "number", example: 300000 },
        deposit_amount: { type: "number", example: 500000 },
        label: { type: "string", example: "Front view", description: "Optional image label/description" },
        image: { type: "string", format: "binary", description: "Vehicle image file (jpg, jpeg, png, gif, webp) - Max 5MB" },
      },
    },
  })
  update(
    @Param("id") id: string,
    @Body() updateVehicleDto: UpdateVehicleDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png|gif|webp)$/,
        })
        .addMaxSizeValidator({
          maxSize: 5 * 1024 * 1024, // 5MB
        })
        .build({
          fileIsRequired: false,
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    image?: any,
  ) {
    return this.vehicleService.update(id, updateVehicleDto, image);
  }
  @Patch("change-status/:id")
  @Roles(Role.ADMIN, Role.STAFF)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: "Vehicle status changed", type: ResponseMsg })
  @ApiErrorResponses()
  @ApiBody({ type: ChangeStatusDto })
  changeStatus(@Param("id") id: string, @Body() changeStatusDto: ChangeStatusDto) {
    return this.vehicleService.changeStatus(id, changeStatusDto);
  }
  @Patch("restore/:id")
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: "Vehicle restored", type: ResponseMsg })
  @ApiErrorResponses()
  restore(@Param("id") id: string) {
    return this.vehicleService.restore(id);
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
