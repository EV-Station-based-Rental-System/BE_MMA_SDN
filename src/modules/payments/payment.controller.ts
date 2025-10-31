import { Controller, Param, Patch, Req, UseGuards } from "@nestjs/common";
import { CashService } from "./cash/cash.service";
import { Roles } from "src/common/decorator/roles.decorator";
import { Role } from "src/common/enums/role.enum";
import { JwtAuthGuard } from "src/common/guards/jwt.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { StaffJwtUserPayload } from "src/common/utils/type";
import { ApiBearerAuth } from "@nestjs/swagger";

@Controller("payments")
@ApiBearerAuth()
export class PaymentController {
  constructor(private readonly cashService: CashService) {}
  @Roles(Role.STAFF)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch("confirm-cash/:id")
  confirmBookingByCash(@Param("id") id: string, @Req() req: { user: StaffJwtUserPayload }) {
    return this.cashService.confirmPaymentByCash(id, req.user);
  }
}
