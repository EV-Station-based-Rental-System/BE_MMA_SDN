import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiExtraModels, ApiOkResponse, ApiQuery } from "@nestjs/swagger";
import { Roles } from "src/common/decorator/roles.decorator";
import { ApiErrorResponses } from "src/common/decorator/swagger.decorator";
import { Role } from "src/common/enums/role.enum";
import { JwtAuthGuard } from "src/common/guards/jwt.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { ResponseMsg } from "src/common/response/response-message";
import { SwaggerResponseDetailDto, SwaggerResponseListDto } from "src/common/response/swagger-generic.dto";
import { RentalPaginationDto } from "src/common/pagination/dto/rental/rental-pagination.dto";
import { Rental } from "src/models/rental.schema";
import { RentalsService } from "./rentals.service";
import { CreateRentalDto } from "./dto/create-rental.dto";
import { UpdateRentalDto } from "./dto/update-rental.dto";
import type { AuthRequest } from "src/common/interfaces/authRequest.interface";

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@ApiExtraModels(Rental)
@Controller("rental")
export class RentalsController {
  constructor(private readonly rentalsService: RentalsService) {}

  @Roles(Role.ADMIN, Role.STAFF)
  @Post()
  @ApiCreatedResponse({ description: "Rental created", type: SwaggerResponseDetailDto(Rental) })
  @ApiErrorResponses()
  @ApiBody({ type: CreateRentalDto })
  create(@Body() createRentalDto: CreateRentalDto) {
    return this.rentalsService.create(createRentalDto);
  }

  @Roles(Role.ADMIN, Role.STAFF)
  @Get()
  @ApiOkResponse({ description: "List of rentals", type: SwaggerResponseListDto(Rental) })
  @ApiErrorResponses()
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "take", required: false, type: Number, example: 10 })
  findAll(@Query() query: RentalPaginationDto) {
    const { page = 1, take = 10, ...rest } = query;
    return this.rentalsService.findAll({
      page,
      take: Math.min(take, 100),
      ...rest,
    });
  }

  @Roles(Role.RENTER)
  @Get("me")
  @ApiOkResponse({ description: "List of renter rentals", type: SwaggerResponseListDto(Rental) })
  @ApiErrorResponses()
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "take", required: false, type: Number, example: 10 })
  findMine(@Req() req: AuthRequest, @Query() query: RentalPaginationDto) {
    const { page = 1, take = 10, ...rest } = query;
    return this.rentalsService.findMine(req.user._id, {
      page,
      take: Math.min(take, 100),
      ...rest,
    });
  }

  @Roles(Role.ADMIN, Role.STAFF)
  @Get(":id")
  @ApiOkResponse({ description: "Rental details", type: SwaggerResponseDetailDto(Rental) })
  @ApiErrorResponses()
  findOne(@Param("id") id: string) {
    return this.rentalsService.findOne(id);
  }

  @Roles(Role.ADMIN, Role.STAFF)
  @Put(":id")
  @ApiOkResponse({ description: "Rental updated", type: SwaggerResponseDetailDto(Rental) })
  @ApiErrorResponses()
  @ApiBody({ type: UpdateRentalDto })
  update(@Param("id") id: string, @Body() updateRentalDto: UpdateRentalDto) {
    return this.rentalsService.update(id, updateRentalDto);
  }

  @Roles(Role.ADMIN, Role.STAFF)
  @Delete(":id")
  @ApiOkResponse({ description: "Rental deleted", type: ResponseMsg })
  @ApiErrorResponses()
  remove(@Param("id") id: string) {
    return this.rentalsService.remove(id);
  }
}
