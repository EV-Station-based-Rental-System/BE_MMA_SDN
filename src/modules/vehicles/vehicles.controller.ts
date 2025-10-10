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
import { Role } from "src/common/enums/role.enum";
import { JwtAuthGuard } from "src/common/guards/jwt.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { MessageResponseDto } from "src/modules/auth/dto/message-response.dto";
import { CreateVehicleDto } from "./dto/create-vehicle.dto";
import { QueryVehicleDto } from "./dto/query-vehicle.dto";
import { UpdateVehicleDto } from "./dto/update-vehicle.dto";
import { VehicleListResponseDto } from "./dto/vehicle-list-response.dto";
import { VehicleResponseDto } from "./dto/vehicle-response.dto";
import { VehiclesService } from "./vehicles.service";

@ApiTags("vehicles")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("vehicles")
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiCreatedResponse({ description: "Vehicle created", type: VehicleResponseDto })
  @ApiBadRequestResponse({ description: "Invalid payload", type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ description: "Unauthorized", type: ErrorResponseDto })
  @ApiForbiddenResponse({ description: "Forbidden", type: ErrorResponseDto })
  @ApiConflictResponse({ description: "Vehicle already exists", type: ErrorResponseDto })
  @ApiInternalServerErrorResponse({ description: "Server error", type: ErrorResponseDto })
  create(@Body() createVehicleDto: CreateVehicleDto) {
    return this.vehiclesService.create(createVehicleDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.STAFF, Role.RENTER)
  @ApiOkResponse({ description: "List of vehicles", type: VehicleListResponseDto })
  @ApiBadRequestResponse({ description: "Invalid query", type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ description: "Unauthorized", type: ErrorResponseDto })
  @ApiForbiddenResponse({ description: "Forbidden", type: ErrorResponseDto })
  @ApiInternalServerErrorResponse({ description: "Server error", type: ErrorResponseDto })
  findAll(@Query() query: QueryVehicleDto) {
    return this.vehiclesService.findAll(query);
  }

  @Get(":id")
  @Roles(Role.ADMIN, Role.STAFF, Role.RENTER)
  @ApiOkResponse({ description: "Vehicle details", type: VehicleResponseDto })
  @ApiBadRequestResponse({ description: "Invalid vehicle id", type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ description: "Unauthorized", type: ErrorResponseDto })
  @ApiForbiddenResponse({ description: "Forbidden", type: ErrorResponseDto })
  @ApiNotFoundResponse({ description: "Vehicle not found", type: ErrorResponseDto })
  @ApiInternalServerErrorResponse({ description: "Server error", type: ErrorResponseDto })
  findOne(@Param("id") id: string) {
    return this.vehiclesService.findOne(id);
  }

  @Patch(":id")
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiOkResponse({ description: "Vehicle updated", type: VehicleResponseDto })
  @ApiBadRequestResponse({ description: "Invalid payload", type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ description: "Unauthorized", type: ErrorResponseDto })
  @ApiForbiddenResponse({ description: "Forbidden", type: ErrorResponseDto })
  @ApiNotFoundResponse({ description: "Vehicle not found", type: ErrorResponseDto })
  @ApiConflictResponse({ description: "Vehicle already exists", type: ErrorResponseDto })
  @ApiInternalServerErrorResponse({ description: "Server error", type: ErrorResponseDto })
  update(@Param("id") id: string, @Body() updateVehicleDto: UpdateVehicleDto) {
    return this.vehiclesService.update(id, updateVehicleDto);
  }

  @Delete(":id")
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiOkResponse({ description: "Vehicle removed", type: MessageResponseDto })
  @ApiBadRequestResponse({ description: "Invalid vehicle id", type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ description: "Unauthorized", type: ErrorResponseDto })
  @ApiForbiddenResponse({ description: "Forbidden", type: ErrorResponseDto })
  @ApiNotFoundResponse({ description: "Vehicle not found", type: ErrorResponseDto })
  @ApiInternalServerErrorResponse({ description: "Server error", type: ErrorResponseDto })
  remove(@Param("id") id: string): Promise<MessageResponseDto> {
    return this.vehiclesService.remove(id);
  }
}
