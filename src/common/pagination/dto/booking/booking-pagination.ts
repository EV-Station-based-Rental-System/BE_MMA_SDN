import { ApiPropertyOptional } from "@nestjs/swagger";
import { BasePaginationDto } from "../basePagination.dto";
import { BookingStatus, BookingVerificationStatus } from "src/common/enums/booking.enum";
import { PaymentMethod } from "src/common/enums/payment.enum";
import { IsEnum, IsOptional, IsString } from "class-validator";

export class BookingPaginationDto extends BasePaginationDto {
  @ApiPropertyOptional({
    description: "Từ khóa tìm kiếm (full_name hoặc email của renter/staff)",
    example: "nguyenvana@gmail.com",
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: "Ngày bắt đầu lọc (format YYYY-MM-DD)",
    example: "2025-10-01",
  })
  @IsOptional()
  @IsString()
  from_date?: string;

  @ApiPropertyOptional({
    description: "Ngày kết thúc lọc (format YYYY-MM-DD)",
    example: "2025-10-30",
  })
  @IsOptional()
  @IsString()
  to_date?: string;

  @ApiPropertyOptional({
    description: "Trạng thái booking",
    enum: BookingStatus,
    example: BookingStatus.PENDING_VERIFICATION,
  })
  @IsOptional()
  @IsEnum(BookingStatus)
  statusBooking?: BookingStatus;

  @ApiPropertyOptional({
    description: "Trạng thái xác minh (confirm)",
    enum: BookingVerificationStatus,
    example: BookingVerificationStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(BookingVerificationStatus)
  statusConfirm?: BookingVerificationStatus;

  @ApiPropertyOptional({
    description: "Phương thức thanh toán",
    enum: PaymentMethod,
    example: PaymentMethod.CASH,
  })
  @IsOptional()
  @IsEnum(PaymentMethod)
  method?: PaymentMethod;
}
