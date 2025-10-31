import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { RentalService } from "./rental.service";
import { ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { RentalPaginationDto } from "src/common/pagination/dto/rental/rental-pagination";
import { Roles } from "src/common/decorator/roles.decorator";
import { Role } from "src/common/enums/role.enum";
import { JwtAuthGuard } from "src/common/guards/jwt.guard";
import { RolesGuard } from "src/common/guards/roles.guard";

@Controller("rentals")
@Roles(Role.ADMIN, Role.STAFF)
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class RentalController {
  constructor(private readonly rentalService: RentalService) {}
  @Get()
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
  async getRentalById(@Param("id") rentalId: string) {
    return this.rentalService.getRentalById(rentalId);
  }
}
