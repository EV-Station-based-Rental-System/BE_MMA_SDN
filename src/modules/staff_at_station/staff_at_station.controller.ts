import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards } from "@nestjs/common";
import { StaffAtStationService } from "./staff_at_station.service";
import { CreateStaffAtStationDto } from "./dto/create-staff_at_station.dto";
import { UpdateStaffAtStationDto } from "./dto/update-staff_at_station.dto";
import { ApiBadRequestResponse, ApiBearerAuth, ApiForbiddenResponse, ApiInternalServerErrorResponse, ApiOkResponse, ApiQuery, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { StaffAtStationPaginationDto } from "src/common/pagination/dto/staff_at_station/staff_at_station-pagination";
import { ResponseBadRequest } from "src/common/response/error/response-bad-request";
import { ResponseUnauthorized } from "src/common/response/error/response-unauthorized";
import { ResponseForbidden } from "src/common/response/error/response-forbidden";
import { ResponseInternalError } from "src/common/response/error/response-internal-error";
import { ResponseDetail } from "src/common/response/response-detail-create-update";
import { ResponseList } from "src/common/response/response-list";
import { ResponseMsg } from "src/common/response/response-message";
import { JwtAuthGuard } from "src/common/guards/jwt.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { Role } from "src/common/enums/role.enum";
import { Roles } from "src/common/decorator/roles.decorator";
import { ChangeRoleDto } from "./dto/changeRole.dto";

@Controller("staff-at-station")
@ApiBearerAuth()
@Roles(Role.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class StaffAtStationController {
  constructor(private readonly staffAtStationService: StaffAtStationService) { }
  @Post()
  @ApiOkResponse({ description: "Create staff at station", type: ResponseDetail })
  @ApiBadRequestResponse({ description: "Invalid payload", type: ResponseBadRequest })
  @ApiUnauthorizedResponse({ description: "Unauthorized", type: ResponseUnauthorized })
  @ApiForbiddenResponse({ description: "Forbidden", type: ResponseForbidden })
  @ApiInternalServerErrorResponse({ description: "Internal server error", type: ResponseInternalError })
  create(@Body() createStaffAtStationDto: CreateStaffAtStationDto) {
    return this.staffAtStationService.create(createStaffAtStationDto);
  }
  @Get()
  @ApiOkResponse({ description: "List of staff at stations", type: ResponseList })
  @ApiBadRequestResponse({ description: "Invalid query", type: ResponseBadRequest })
  @ApiUnauthorizedResponse({ description: "Unauthorized", type: ResponseUnauthorized })
  @ApiForbiddenResponse({ description: "Forbidden", type: ResponseForbidden })
  @ApiInternalServerErrorResponse({ description: "Internal server error", type: ResponseInternalError })
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "take", required: false, type: Number, example: 10 })
  findAll(@Query() query: StaffAtStationPaginationDto) {
    const { page = 1, take = 10, ...restFilters } = query;
    return this.staffAtStationService.findAll({
      page,
      take: Math.min(take, 100),
      ...restFilters,
    });
  }
  @Get(":id")
  @ApiOkResponse({ description: "Staff at station found", type: ResponseDetail })
  @ApiBadRequestResponse({ description: "Invalid ID format", type: ResponseBadRequest })
  @ApiUnauthorizedResponse({ description: "Unauthorized", type: ResponseUnauthorized })
  @ApiForbiddenResponse({ description: "Forbidden", type: ResponseForbidden })
  @ApiInternalServerErrorResponse({ description: "Internal server error", type: ResponseInternalError })
  findOne(@Param("id") id: string) {
    return this.staffAtStationService.findOne(id);
  }
  @Put(":id")
  @ApiOkResponse({ description: "Update staff at station", type: ResponseDetail })
  @ApiBadRequestResponse({ description: "Invalid payload or ID format", type: ResponseBadRequest })
  @ApiUnauthorizedResponse({ description: "Unauthorized", type: ResponseUnauthorized })
  @ApiForbiddenResponse({ description: "Forbidden", type: ResponseForbidden })
  @ApiInternalServerErrorResponse({ description: "Internal server error", type: ResponseInternalError })
  update(@Param("id") id: string, @Body() updateStaffAtStationDto: UpdateStaffAtStationDto) {
    return this.staffAtStationService.update(id, updateStaffAtStationDto);
  }
  @Patch(":id")
  @ApiOkResponse({ description: "Update staff at station role", type: ResponseMsg })
  @ApiBadRequestResponse({ description: "Invalid payload or ID format", type: ResponseBadRequest })
  @ApiUnauthorizedResponse({ description: "Unauthorized", type: ResponseUnauthorized })
  @ApiForbiddenResponse({ description: "Forbidden", type: ResponseForbidden })
  @ApiInternalServerErrorResponse({ description: "Internal server error", type: ResponseInternalError })
  updateRoleAtStation(@Param("id") id: string, @Body() body: ChangeRoleDto) {
    return this.staffAtStationService.updateRoleAtStation(id, body);
  }
  @Delete(":id")
  @ApiOkResponse({ description: "Delete staff at station", type: ResponseMsg })
  @ApiBadRequestResponse({ description: "Invalid ID format", type: ResponseBadRequest })
  @ApiUnauthorizedResponse({ description: "Unauthorized", type: ResponseUnauthorized })
  @ApiForbiddenResponse({ description: "Forbidden", type: ResponseForbidden })
  @ApiInternalServerErrorResponse({ description: "Internal server error", type: ResponseInternalError })
  remove(@Param("id") id: string) {
    return this.staffAtStationService.remove(id);
  }
}
