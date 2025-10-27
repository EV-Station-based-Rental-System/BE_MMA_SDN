import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiExtraModels, ApiOkResponse, ApiQuery } from "@nestjs/swagger";
import { Roles } from "src/common/decorator/roles.decorator";
import { ApiErrorResponses } from "src/common/decorator/swagger.decorator";
import { Role } from "src/common/enums/role.enum";
import { JwtAuthGuard } from "src/common/guards/jwt.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { ResponseMsg } from "src/common/response/response-message";
import { SwaggerResponseDetailDto, SwaggerResponseListDto } from "src/common/response/swagger-generic.dto";
import { PaymentPaginationDto } from "src/common/pagination/dto/payment/payment-pagination.dto";
import { Payment } from "src/models/payment.schema";
import { PaymentsService } from "./payments.service";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { UpdatePaymentDto } from "./dto/update-payment.dto";

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@ApiExtraModels(Payment)
@Controller("payment")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Roles(Role.ADMIN, Role.STAFF)
  @Post()
  @ApiCreatedResponse({ description: "Payment created", type: SwaggerResponseDetailDto(Payment) })
  @ApiErrorResponses()
  @ApiBody({ type: CreatePaymentDto })
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(createPaymentDto);
  }

  @Roles(Role.ADMIN, Role.STAFF)
  @Get()
  @ApiOkResponse({ description: "List of payments", type: SwaggerResponseListDto(Payment) })
  @ApiErrorResponses()
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "take", required: false, type: Number, example: 10 })
  findAll(@Query() query: PaymentPaginationDto) {
    const { page = 1, take = 10, ...rest } = query;
    return this.paymentsService.findAll({
      page,
      take: Math.min(take, 100),
      ...rest,
    });
  }

  @Roles(Role.ADMIN, Role.STAFF)
  @Get(":id")
  @ApiOkResponse({ description: "Payment details", type: SwaggerResponseDetailDto(Payment) })
  @ApiErrorResponses()
  findOne(@Param("id") id: string) {
    return this.paymentsService.findOne(id);
  }

  @Roles(Role.ADMIN, Role.STAFF)
  @Put(":id")
  @ApiOkResponse({ description: "Payment updated", type: SwaggerResponseDetailDto(Payment) })
  @ApiErrorResponses()
  @ApiBody({ type: UpdatePaymentDto })
  update(@Param("id") id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentsService.update(id, updatePaymentDto);
  }

  @Roles(Role.ADMIN, Role.STAFF)
  @Delete(":id")
  @ApiOkResponse({ description: "Payment deleted", type: ResponseMsg })
  @ApiErrorResponses()
  remove(@Param("id") id: string) {
    return this.paymentsService.remove(id);
  }
}
