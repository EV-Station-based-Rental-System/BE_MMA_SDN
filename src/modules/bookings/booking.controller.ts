import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiExtraModels, ApiOkResponse, ApiQuery } from "@nestjs/swagger";
import { BookingService } from "./booking.service";
import { CreateBookingDto } from "./dto/createBooking.dto";
import { RenterJwtUserPayload, StaffJwtUserPayload } from "src/common/utils/type";
import { JwtAuthGuard } from "src/common/guards/jwt.guard";
import { ChangeStatusBookingDto } from "./dto/changeStatus.dto";
import { Roles } from "src/common/decorator/roles.decorator";
import { Role } from "src/common/enums/role.enum";
import { RolesGuard } from "src/common/guards/roles.guard";
import { BookingPaginationDto } from "src/common/pagination/dto/booking/booking-pagination";
import { ApiErrorResponses } from "src/common/decorator/swagger.decorator";
import { SwaggerResponseDetailDto } from "src/common/response/swagger-generic.dto";
import { Booking } from "src/models/booking.schema";
import { BookingListResponse } from "./dto/booking-response.dto";

@ApiExtraModels(Booking)
@Controller("bookings")
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiCreatedResponse({
    description: "Booking created",
    schema: {
      type: "object",
      properties: {
        data: {
          type: "object",
          properties: {
            payUrl: { type: "string" },
          },
        },
      },
    },
  })
  @ApiErrorResponses()
  @ApiBody({ type: CreateBookingDto })
  createBooking(@Body() createBookingDto: CreateBookingDto, @Req() req: { user: RenterJwtUserPayload }) {
    return this.bookingService.createBooking(createBookingDto, req.user);
  }

  @Patch("confirm/:id")
  @Roles(Role.STAFF)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: "Booking confirmed", type: SwaggerResponseDetailDto(Booking) })
  @ApiErrorResponses()
  @ApiBody({ type: ChangeStatusBookingDto })
  confirmBooking(@Param("id") id: string, @Req() req: { user: StaffJwtUserPayload }, @Body() changeStatusDto: ChangeStatusBookingDto) {
    return this.bookingService.confirmBooking(id, req.user, changeStatusDto);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STAFF, Role.ADMIN)
  @ApiOkResponse({ description: "List of bookings with populated relationships", type: BookingListResponse })
  @ApiErrorResponses()
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "take", required: false, type: Number, example: 10 })
  async getAllBookings(@Query() filters: BookingPaginationDto) {
    const { page = 1, take = 10, ...restFilters } = filters;
    return this.bookingService.getAllBookings({ page, take: Math.min(take, 100), ...restFilters });
  }

  @Get(":id")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STAFF, Role.ADMIN, Role.RENTER)
  @ApiOkResponse({ description: "Booking details", type: SwaggerResponseDetailDto(Booking) })
  @ApiErrorResponses()
  async getBookingById(@Param("id") id: string) {
    return this.bookingService.getBookingById(id);
  }

  @Get("history-renter")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.RENTER)
  @ApiOkResponse({ description: "List of renter's bookings", type: SwaggerResponseListDto(Booking) })
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "take", required: false, type: Number, example: 10 })
  @ApiErrorResponses()
  async getBookingsByRenter(@Query() filters: BookingPaginationDto, @Req() req: { user: RenterJwtUserPayload }) {
    const { page = 1, take = 10, ...restFilters } = filters;
    return this.bookingService.getBookingByRenter({ page, take: Math.min(take, 100), ...restFilters }, req.user);
  }

  @Patch("cancel/:id")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.RENTER)
  @ApiOkResponse({ description: "Booking cancelled", type: SwaggerResponseDetailDto(Booking) })
  @ApiErrorResponses()
  async cancelBooking(@Param("id") id: string) {
    return this.bookingService.cancelBooking(id);
  }
}
