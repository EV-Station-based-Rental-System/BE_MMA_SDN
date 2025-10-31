import { Controller, Get, Param, Query } from "@nestjs/common";
import { RentalService } from "./rental.service";
import { ApiQuery } from "@nestjs/swagger";
import { RentalPaginationDto } from "src/common/pagination/dto/rental/rental-pagination";

@Controller("rentals")
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
