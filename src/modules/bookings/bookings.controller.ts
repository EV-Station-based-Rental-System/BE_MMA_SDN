import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiExtraModels, ApiOkResponse, ApiQuery } from "@nestjs/swagger";
import { Roles } from "src/common/decorator/roles.decorator";
import { ApiErrorResponses } from "src/common/decorator/swagger.decorator";
import { Role } from "src/common/enums/role.enum";
import { JwtAuthGuard } from "src/common/guards/jwt.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { ResponseMsg } from "src/common/response/response-message";
import { SwaggerResponseDetailDto, SwaggerResponseListDto } from "src/common/response/swagger-generic.dto";
import { BookingPaginationDto } from "src/common/pagination/dto/booking/booking-pagination.dto";
import { Booking } from "src/models/booking.schema";
import { BookingsService } from "./bookings.service";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { UpdateBookingDto } from "./dto/update-booking.dto";
import { CancelBookingDto } from "./dto/cancel-booking.dto";
import type { AuthRequest } from "src/common/interfaces/authRequest.interface";

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@ApiExtraModels(Booking)
@Controller("booking")
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Roles(Role.ADMIN, Role.STAFF)
  @Post()
  @ApiCreatedResponse({ description: "Booking created", type: SwaggerResponseDetailDto(Booking) })
  @ApiErrorResponses()
  @ApiBody({ type: CreateBookingDto })
  create(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.create(createBookingDto);
  }

  @Roles(Role.ADMIN, Role.STAFF)
  @Get()
  @ApiOkResponse({ description: "List of bookings", type: SwaggerResponseListDto(Booking) })
  @ApiErrorResponses()
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "take", required: false, type: Number, example: 10 })
  findAll(@Query() query: BookingPaginationDto) {
    const { page = 1, take = 10, ...rest } = query;
    return this.bookingsService.findAll({
      page,
      take: Math.min(take, 100),
      ...rest,
    });
  }

  @Roles(Role.RENTER)
  @Get("me")
  @ApiOkResponse({ description: "List of renter bookings", type: SwaggerResponseListDto(Booking) })
  @ApiErrorResponses()
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "take", required: false, type: Number, example: 10 })
  findMine(@Req() req: AuthRequest, @Query() query: BookingPaginationDto) {
    const { page = 1, take = 10, renter_id, ...rest } = query;
    void renter_id;
    return this.bookingsService.findMine(req.user._id, {
      page,
      take: Math.min(take, 100),
      ...rest,
    });
  }

  @Roles(Role.ADMIN, Role.STAFF)
  @Get(":id")
  @ApiOkResponse({ description: "Booking details", type: SwaggerResponseDetailDto(Booking) })
  @ApiErrorResponses()
  findOne(@Param("id") id: string) {
    return this.bookingsService.findOne(id);
  }

  @Roles(Role.ADMIN, Role.STAFF)
  @Put(":id")
  @ApiOkResponse({ description: "Booking updated", type: SwaggerResponseDetailDto(Booking) })
  @ApiErrorResponses()
  @ApiBody({ type: UpdateBookingDto })
  update(@Param("id") id: string, @Body() updateBookingDto: UpdateBookingDto) {
    return this.bookingsService.update(id, updateBookingDto);
  }

  @Roles(Role.ADMIN, Role.STAFF)
  @Delete(":id")
  @ApiOkResponse({ description: "Booking deleted", type: ResponseMsg })
  @ApiErrorResponses()
  remove(@Param("id") id: string) {
    return this.bookingsService.remove(id);
  }

  @Roles(Role.RENTER)
  @Patch(":id/cancel")
  @ApiOkResponse({ description: "Booking cancelled", type: SwaggerResponseDetailDto(Booking) })
  @ApiErrorResponses()
  @ApiBody({ type: CancelBookingDto })
  cancel(@Param("id") id: string, @Body() cancelBookingDto: CancelBookingDto, @Req() req: AuthRequest) {
    return this.bookingsService.cancel(id, req.user._id, cancelBookingDto);
  }
}
