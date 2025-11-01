import { Controller, Get, Body, Patch, Param, Delete, Put, UseGuards, Query } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UpdateRenterDto } from "./dto/renter.dto";
import { UpdateStaffDto } from "./dto/staff.dto";
import { Roles } from "src/common/decorator/roles.decorator";
import { Role } from "src/common/enums/role.enum";
import { JwtAuthGuard } from "src/common/guards/jwt.guard";
import { ApiBearerAuth, ApiOkResponse, ApiQuery, ApiBody, ApiExtraModels } from "@nestjs/swagger";
import { RolesGuard } from "src/common/guards/roles.guard";
import { UserPaginationDto } from "src/common/pagination/dto/user/user-pagination.dto";
import { ResponseMsg } from "src/common/response/response-message";
import { StaffPaginationDto } from "src/common/pagination/dto/staff/staff-pagination";
import { ApiErrorResponses } from "src/common/decorator/swagger.decorator";
import { SwaggerResponseListDto, SwaggerResponseDetailDto } from "src/common/response/swagger-generic.dto";
import { Renter } from "src/models/renter.schema";
import { Staff } from "src/models/staff.schema";
import { User } from "src/models/user.schema";
import { Kycs } from "src/models/kycs.schema";
import { Station } from "src/models/station.schema";
import { UserWithRoleExtra } from "src/common/interfaces/user.interface";

@ApiExtraModels(Renter, Staff, User, Kycs, Station, UserWithRoleExtra)
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("renter")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiOkResponse({ description: "List of renters with populated roleExtra", type: SwaggerResponseListDto(UserWithRoleExtra) })
  @ApiErrorResponses()
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "take", required: false, type: Number, example: 10 })
  async findAllUser(@Query() query: UserPaginationDto) {
    const { page = 1, take = 10, ...restFilters } = query;
    return await this.usersService.findAllUser({
      page,
      take: Math.min(take, 100),
      ...restFilters,
    });
  }

  @Get("staff")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOkResponse({ description: "List of staff", type: SwaggerResponseListDto(Staff) })
  @ApiErrorResponses()
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "take", required: false, type: Number, example: 10 })
  async findAllStaff(@Query() query: StaffPaginationDto) {
    const { page = 1, take = 10, ...restFilters } = query;
    return await this.usersService.findAllStaff({
      page,
      take: Math.min(take, 100),
      ...restFilters,
    });
  }

  @Get(":id")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF, Role.RENTER)
  @ApiOkResponse({ description: "User details with populated roleExtra", type: SwaggerResponseDetailDto(UserWithRoleExtra) })
  @ApiErrorResponses()
  async findOne(@Param("id") id: string) {
    return this.usersService.findOne(id);
  }

  @Put("update-renter/:id")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF, Role.RENTER)
  @ApiOkResponse({ description: "Renter updated with populated roleExtra", type: SwaggerResponseDetailDto(UserWithRoleExtra) })
  @ApiErrorResponses()
  @ApiBody({ type: UpdateRenterDto })
  updateRenter(@Param("id") id: string, @Body() body: UpdateRenterDto) {
    return this.usersService.updateRenter(id, body);
  }

  @Put("update-staff/:id")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOkResponse({ description: "Staff updated with populated roleExtra", type: SwaggerResponseDetailDto(UserWithRoleExtra) })
  @ApiErrorResponses()
  @ApiBody({ type: UpdateStaffDto })
  updateStaff(@Param("id") id: string, @Body() body: UpdateStaffDto) {
    return this.usersService.updateStaff(id, body);
  }

  @Patch("soft-delete/:id")
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: "User soft deleted", type: ResponseMsg })
  @ApiErrorResponses()
  softDelete(@Param("id") id: string) {
    return this.usersService.softDelete(id);
  }

  @Patch("restore/:id")
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: "User status restored", type: ResponseMsg })
  @ApiErrorResponses()
  restore(@Param("id") id: string) {
    return this.usersService.restoreStatus(id);
  }

  @Delete(":id")
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: "User hard deleted", type: ResponseMsg })
  @ApiErrorResponses()
  hardDelete(@Param("id") id: string) {
    return this.usersService.hardDelete(id);
  }
}
