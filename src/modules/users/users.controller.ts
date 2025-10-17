import { Controller, Get, Body, Patch, Param, Delete, Put, UseGuards, Query } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UpdateRenterDto } from "./dto/renter.dto";
import { UpdateStaffDto } from "./dto/staff.dto";
import { Roles } from "src/common/decorator/roles.decorator";
import { Role } from "src/common/enums/role.enum";
import { JwtAuthGuard } from "src/common/guards/jwt.guard";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { RolesGuard } from "src/common/guards/roles.guard";
import { UserPaginationDto } from "src/common/pagination/dto/user/user-pagination.dto";
import { ResponseList } from "src/common/response/response-list";
import { ResponseBadRequest } from "src/common/response/error/response-bad-request";
import { ResponseUnauthorized } from "src/common/response/error/response-unauthorized";
import { ResponseForbidden } from "src/common/response/error/response-forbidden";
import { ResponseInternalError } from "src/common/response/error/response-internal-error";
import { ResponseDetail } from "src/common/response/response-detail-create-update";
import { ResponseMsg } from "src/common/response/response-message";

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles(Role.ADMIN, Role.STAFF)
  @Get()
  @ApiOperation({ summary: "Get all users for admin" })
  @ApiOkResponse({ description: "List of users", type: ResponseList })
  @ApiBadRequestResponse({ description: "Invalid query", type: ResponseBadRequest })
  @ApiUnauthorizedResponse({ description: "Unauthorized", type: ResponseUnauthorized })
  @ApiForbiddenResponse({ description: "Forbidden", type: ResponseForbidden })
  @ApiInternalServerErrorResponse({ description: "Server error", type: ResponseInternalError })
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "take", required: false, type: Number, example: 10 })
  async findAll(@Query() query: UserPaginationDto) {
    const { page = 1, take = 10, ...restFilters } = query;
    return await this.usersService.findAll({
      page,
      take: Math.min(take, 100),
      ...restFilters,
    });
  }

  @Roles(Role.ADMIN, Role.STAFF, Role.RENTER)
  @Get(":id")
  @ApiOkResponse({ description: "User details", type: ResponseDetail })
  @ApiBadRequestResponse({ description: "Invalid user id", type: ResponseBadRequest })
  @ApiUnauthorizedResponse({ description: "Unauthorized", type: ResponseUnauthorized })
  @ApiForbiddenResponse({ description: "Forbidden", type: ResponseForbidden })
  @ApiInternalServerErrorResponse({ description: "Server error", type: ResponseInternalError })
  @ApiOperation({ summary: "Get user by id" })
  async findOne(@Param("id") id: string) {
    return this.usersService.findOne(id);
  }

  @Roles(Role.ADMIN, Role.STAFF, Role.RENTER)
  @Put("update-renter/:id")
  @ApiOkResponse({ description: "Renter updated", type: ResponseDetail })
  @ApiBadRequestResponse({ description: "Invalid payload", type: ResponseBadRequest })
  @ApiUnauthorizedResponse({ description: "Unauthorized", type: ResponseUnauthorized })
  @ApiForbiddenResponse({ description: "Forbidden", type: ResponseForbidden })
  @ApiInternalServerErrorResponse({ description: "Server error", type: ResponseInternalError })
  @ApiOperation({ summary: "Update renter information" })
  updateRenter(@Param("id") id: string, @Body() body: UpdateRenterDto) {
    return this.usersService.updateRenter(id, body);
  }

  @Roles(Role.ADMIN)
  @Put("update-staff/:id")
  @ApiOkResponse({ description: "Staff updated", type: ResponseDetail })
  @ApiBadRequestResponse({ description: "Invalid payload", type: ResponseBadRequest })
  @ApiUnauthorizedResponse({ description: "Unauthorized", type: ResponseUnauthorized })
  @ApiForbiddenResponse({ description: "Forbidden", type: ResponseForbidden })
  @ApiInternalServerErrorResponse({ description: "Server error", type: ResponseInternalError })
  @ApiOperation({ summary: "Update staff information" })
  updateStaff(@Param("id") id: string, @Body() body: UpdateStaffDto) {
    return this.usersService.updateStaff(id, body);
  }

  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: "Soft delete user" })
  @ApiOkResponse({ description: "User soft deleted", type: ResponseMsg })
  @ApiBadRequestResponse({ description: "Invalid user id", type: ResponseBadRequest })
  @ApiUnauthorizedResponse({ description: "Unauthorized", type: ResponseUnauthorized })
  @ApiForbiddenResponse({ description: "Forbidden", type: ResponseForbidden })
  @ApiInternalServerErrorResponse({ description: "Server error", type: ResponseInternalError })
  @Patch("soft-delete/:id")
  softDelete(@Param("id") id: string) {
    return this.usersService.softDelete(id);
  }

  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: "Restore user status" })
  @ApiOkResponse({ description: "User status restored", type: ResponseMsg })
  @ApiBadRequestResponse({ description: "Invalid user id", type: ResponseBadRequest })
  @ApiUnauthorizedResponse({ description: "Unauthorized", type: ResponseUnauthorized })
  @ApiForbiddenResponse({ description: "Forbidden", type: ResponseForbidden })
  @ApiInternalServerErrorResponse({ description: "Server error", type: ResponseInternalError })
  @Patch("restore/:id")
  restore(@Param("id") id: string) {
    return this.usersService.restoreStatus(id);
  }

  @Roles(Role.ADMIN)
  @Delete(":id")
  @ApiOperation({ summary: "Hard delete user" })
  @ApiOkResponse({ description: "User hard deleted", type: ResponseMsg })
  @ApiBadRequestResponse({ description: "Invalid user id", type: ResponseBadRequest })
  @ApiUnauthorizedResponse({ description: "Unauthorized", type: ResponseUnauthorized })
  @ApiForbiddenResponse({ description: "Forbidden", type: ResponseForbidden })
  @ApiInternalServerErrorResponse({ description: "Server error", type: ResponseInternalError })
  hardDelete(@Param("id") id: string) {
    return this.usersService.hardDelete(id);
  }
}
