import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { BookingService } from "./booking.service";
import { CreateBookingDto } from "./dto/createBooking.dto";
import { RenterJwtUserPayload, StaffJwtUserPayload } from "src/common/utils/type";
import { JwtAuthGuard } from "src/common/guards/jwt.guard";
import { ChangeStatusBookingDto } from "./dto/changeStatus.dto";
import { Roles } from "src/common/decorator/roles.decorator";
import { Role } from "src/common/enums/role.enum";
import { RolesGuard } from "src/common/guards/roles.guard";
import { BookingPaginationDto } from "src/common/pagination/dto/booking/booking-pagination";

@Controller("bookings")
@ApiBearerAuth()
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Roles(Role.RENTER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  createBooking(@Body() createBookingDto: CreateBookingDto, @Req() req: { user: RenterJwtUserPayload }) {
    return this.bookingService.createBooking(createBookingDto, req.user);
  }
  @Roles(Role.STAFF)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch("confirm/:id")
  confirmBooking(@Param("id") id: string, @Req() req: { user: StaffJwtUserPayload }, @Body() changeStatusDto: ChangeStatusBookingDto) {
    return this.bookingService.confirmBooking(id, req.user, changeStatusDto);
  }

  @Roles(Role.STAFF, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "take", required: false, type: Number, example: 10 })
  async getAllBookings(@Query() filters: BookingPaginationDto) {
    const { page = 1, take = 10, ...restFilters } = filters;
    return this.bookingService.getAllBookings({ page, take: Math.min(take, 100), ...restFilters });
  }

  @Roles(Role.STAFF, Role.ADMIN, Role.RENTER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(":id")
  async getBookingById(@Param("id") id: string) {
    return this.bookingService.getBookingById(id);
  }
}
