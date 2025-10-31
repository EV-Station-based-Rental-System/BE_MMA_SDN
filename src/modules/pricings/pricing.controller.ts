import { Body, Controller, Delete, Param, Post, Put, UseGuards } from "@nestjs/common";
import { PricingService } from "./pricing.service";
import { CreatePricingDto } from "./dto/createPricing.dto";
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiExtraModels, ApiOkResponse } from "@nestjs/swagger";
import { Roles } from "src/common/decorator/roles.decorator";
import { Role } from "src/common/enums/role.enum";
import { RolesGuard } from "src/common/guards/roles.guard";
import { JwtAuthGuard } from "src/common/guards/jwt.guard";
import { ApiErrorResponses } from "src/common/decorator/swagger.decorator";
import { SwaggerResponseDetailDto } from "src/common/response/swagger-generic.dto";
import { ResponseMsg } from "src/common/response/response-message";
import { Pricing } from "src/models/pricings.schema";

@ApiExtraModels(Pricing)
@Controller("pricings")
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiCreatedResponse({ description: "Pricing created", type: SwaggerResponseDetailDto(Pricing) })
  @ApiErrorResponses()
  @ApiBody({ type: CreatePricingDto })
  create(@Body() createPricingDto: CreatePricingDto) {
    return this.pricingService.create(createPricingDto);
  }

  @Put(":id")
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.STAFF)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOkResponse({ description: "Pricing updated", type: SwaggerResponseDetailDto(Pricing) })
  @ApiErrorResponses()
  @ApiBody({ type: CreatePricingDto })
  update(@Body() updatePricingDto: CreatePricingDto, @Param("id") id: string) {
    return this.pricingService.update(id, updatePricingDto);
  }

  @Delete(":id")
  @Roles(Role.ADMIN, Role.STAFF)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: "Pricing deleted", type: ResponseMsg })
  @ApiErrorResponses()
  remove(@Param("id") id: string) {
    return this.pricingService.delete(id);
  }
}
