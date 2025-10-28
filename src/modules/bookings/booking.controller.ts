import { Body, Controller, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { BookingService } from "./booking.service";
import { CreateBookingDto } from "./dto/createBooking.dto";
import { AdminJwtUserPayload, RenterJwtUserPayload, StaffJwtUserPayload } from "src/common/utils/type";
import { MomoService } from "../payments/momo/momo.service";
import { ConfigService } from "@nestjs/config";
import { JwtAuthGuard } from "src/common/guards/jwt.guard";
import { ChangeStatusBookingDto } from "./dto/changeStatus.dto";
import { Roles } from "src/common/decorator/roles.decorator";
import { Role } from "src/common/enums/role.enum";
import { RolesGuard } from "src/common/guards/roles.guard";

@Controller("bookings")
@ApiBearerAuth()
export class BookingController {
  constructor(
    private readonly bookingService: BookingService,
    private readonly momoService: MomoService,
    private readonly configService: ConfigService,
  ) {}

  @Roles(Role.RENTER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  createBooking(@Body() createBookingDto: CreateBookingDto, @Req() req: { user: RenterJwtUserPayload }) {
    return this.bookingService.createBooking(createBookingDto, req.user);
  }
  @Roles(Role.STAFF, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(":id")
  verifyPaymentByStaff(
    @Param("id") id: string,
    @Req() req: { user: StaffJwtUserPayload | AdminJwtUserPayload },
    @Body() changeStatusDto: ChangeStatusBookingDto,
  ) {
    return this.bookingService.confirmBooking(id, req.user, changeStatusDto);
  }
}
