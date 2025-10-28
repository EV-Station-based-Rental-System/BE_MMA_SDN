import { Body, Controller, Delete, Param, Post, Put, UseGuards } from "@nestjs/common";
import { PricingService } from "./pricing.service";
import { CreatePricingDto } from "./dto/createPricing.dto";
import { ApiBearerAuth } from "@nestjs/swagger";
import { Roles } from "src/common/decorator/roles.decorator";
import { Role } from "src/common/enums/role.enum";
import { RolesGuard } from "src/common/guards/roles.guard";
import { JwtAuthGuard } from "src/common/guards/jwt.guard";

@ApiBearerAuth()
@Controller("pricings")
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Roles(Role.ADMIN, Role.STAFF)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  create(@Body() createPricingDto: CreatePricingDto) {
    return this.pricingService.create(createPricingDto);
  }
  @Roles(Role.ADMIN, Role.STAFF)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(":id")
  update(@Body() updatePricingDto: CreatePricingDto, @Param("id") id: string) {
    return this.pricingService.update(id, updatePricingDto);
  }
  @Roles(Role.ADMIN, Role.STAFF)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.pricingService.delete(id);
  }
}
