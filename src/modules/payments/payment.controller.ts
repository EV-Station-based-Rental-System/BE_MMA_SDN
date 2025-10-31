import { Controller, Param, Patch, Req, UseGuards } from "@nestjs/common";
import { CashService } from "./cash/cash.service";
import { Roles } from "src/common/decorator/roles.decorator";
import { Role } from "src/common/enums/role.enum";
import { JwtAuthGuard } from "src/common/guards/jwt.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { StaffJwtUserPayload } from "src/common/utils/type";
import { ApiBearerAuth, ApiExtraModels, ApiOkResponse } from "@nestjs/swagger";
import { ApiErrorResponses } from "src/common/decorator/swagger.decorator";
import { Payment } from "src/models/payment.schema";
import { ResponseMsg } from "src/common/response/response-message";

@ApiExtraModels(Payment)
@Controller("payments")
export class PaymentController {
  constructor(private readonly cashService: CashService) {}

  @Patch("confirm-cash/:id")
  @Roles(Role.STAFF)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: "Payment confirmed successfully", type: ResponseMsg })
  @ApiErrorResponses()
  async confirmBookingByCash(@Param("id") id: string, @Req() req: { user: StaffJwtUserPayload }): Promise<ResponseMsg> {
    return await this.cashService.confirmPaymentByCash(id, req.user);
  }
}
