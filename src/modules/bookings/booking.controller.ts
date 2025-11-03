import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiExtraModels, ApiOkResponse, ApiQuery } from "@nestjs/swagger";
import { BookingService } from "./booking.service";
import { CreateBookingDto } from "./dto/createBooking.dto";
import { BookingAggregateResult, RenterJwtUserPayload, StaffJwtUserPayload } from "src/common/utils/type";
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
import { ResponseList } from "src/common/response/response-list";
import { ResponseMsg } from "src/common/response/response-message";
import { BookingStatisticsDto, MonthlyRevenueDto } from "./dto/booking-statistics.dto";
import { ResponseDetail } from "src/common/response/response-detail-create-update";

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

  @Get("history-renter")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.RENTER)
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "take", required: false, type: Number, example: 10 })
  @ApiErrorResponses()
  getBookingsByRenter(
    @Query() filters: BookingPaginationDto,
    @Req() req: { user: RenterJwtUserPayload },
  ): Promise<ResponseList<BookingAggregateResult>> {
    const { page = 1, take = 10, ...restFilters } = filters;
    return this.bookingService.getBookingByRenter({ page, take: Math.min(take, 100), ...restFilters }, req.user);
  }

  @Get(":id")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STAFF, Role.ADMIN, Role.RENTER)
  @ApiOkResponse({ description: "Booking details", type: SwaggerResponseDetailDto(Booking) })
  @ApiErrorResponses()
  getBookingById(@Param("id") id: string) {
    return this.bookingService.getBookingById(id);
  }

  @Patch("cancel/:id")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.RENTER, Role.STAFF, Role.ADMIN)
  @ApiOkResponse({ description: "Booking cancelled", type: ResponseMsg })
  @ApiErrorResponses()
  cancelBooking(@Param("id") id: string): Promise<ResponseMsg> {
    return this.bookingService.cancelBooking(id);
  }

  // ==================== STATISTICS ENDPOINTS ====================

  @Get("statistics/monthly-revenue")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STAFF, Role.ADMIN)
  @ApiOkResponse({
    description: "Monthly revenue statistics",
    schema: {
      type: "object",
      properties: {
        data: {
          type: "object",
          properties: {
            data: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  month: { type: "number" },
                  monthName: { type: "string" },
                  totalRevenue: { type: "number" },
                  totalBookings: { type: "number" },
                },
              },
            },
            year: { type: "number" },
            totalYearRevenue: { type: "number" },
            totalYearBookings: { type: "number" },
          },
        },
      },
    },
  })
  @ApiErrorResponses()
  @ApiQuery({ name: "year", required: false, type: Number, example: 2025 })
  getMonthlyRevenue(@Query() dto: MonthlyRevenueDto): Promise<ResponseDetail<any>> {
    return this.bookingService.getMonthlyRevenue(dto);
  }

  @Get("statistics/booking-count")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STAFF, Role.ADMIN)
  @ApiOkResponse({
    description: "Booking count statistics by period (day/week/month)",
    schema: {
      type: "object",
      properties: {
        data: {
          type: "object",
          properties: {
            period: { type: "string", enum: ["day", "week", "month"] },
            year: { type: "number" },
            month: { type: "number" },
            data: { type: "array", items: { type: "object" } },
            summary: {
              type: "object",
              properties: {
                totalBookings: { type: "number" },
                totalRevenue: { type: "number" },
                verifiedBookings: { type: "number" },
                pendingBookings: { type: "number" },
                cancelledBookings: { type: "number" },
              },
            },
          },
        },
      },
    },
  })
  @ApiErrorResponses()
  @ApiQuery({ name: "period", required: true, enum: ["day", "week", "month"], example: "month" })
  @ApiQuery({ name: "year", required: false, type: Number, example: 2025 })
  @ApiQuery({ name: "month", required: false, type: Number, example: 11 })
  getBookingStatistics(@Query() dto: BookingStatisticsDto): Promise<ResponseDetail<any>> {
    return this.bookingService.getBookingStatistics(dto);
  }
}
