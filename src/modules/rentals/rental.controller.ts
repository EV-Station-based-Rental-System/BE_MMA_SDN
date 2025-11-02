import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { RentalService } from "./rental.service";
import { ApiBearerAuth, ApiOkResponse, ApiQuery } from "@nestjs/swagger";
import { RentalPaginationDto } from "src/common/pagination/dto/rental/rental-pagination";
import { Roles } from "src/common/decorator/roles.decorator";
import { Role } from "src/common/enums/role.enum";
import { JwtAuthGuard } from "src/common/guards/jwt.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { ApiErrorResponses } from "src/common/decorator/swagger.decorator";

// import { SwaggerResponseListDto, SwaggerResponseDetailDto } from "src/common/response/swagger-generic.dto";

@Controller("rentals")
export class RentalController {
  constructor(private readonly rentalService: RentalService) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiOkResponse({
    description: "List of rentals with populated booking, inspections, and contract",
    // type: SwaggerResponseListDto(RentalRes),
  })
  @ApiErrorResponses()
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "take", required: false, type: Number, example: 10 })
  async getAllRentals(@Query() filter: RentalPaginationDto) {
    const { page = 1, take = 10, ...restFilters } = filter;
    return this.rentalService.getAllRentals({
      page,
      take: Math.min(take, 100),
      ...restFilters,
    });
  }

  @Get(":id")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiOkResponse({
    description: "Rental details with populated booking, inspections, and contract",
    // type: SwaggerResponseDetailDto(ReturnRentalMapping),
  })
  @ApiErrorResponses()
  async getRentalById(@Param("id") rentalId: string) {
    return this.rentalService.getRentalById(rentalId);
  }
}
