import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsMongoId, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsString } from "class-validator";
import { RentalStatus } from "src/common/enums/rental.enum";

export class CreateRentalDto {
  @ApiProperty({
    description: "ID của booking đã được xác nhận",
    example: "booking_id",
  })
  @IsMongoId()
  @IsNotEmpty()
  booking_id: string;

  @ApiProperty({
    description: "ID của xe được thuê",
    example: "vehicle_id",
  })
  @IsMongoId()
  @IsNotEmpty()
  vehicle_id: string;

  @ApiProperty({
    description: "Thời gian khách nhận xe (ngày/giờ thực tế hoặc dự kiến)",
    example: "2025-10-29T09:00:00Z",
  })
  @IsDateString()
  @IsNotEmpty()
  pickup_datetime: Date;

  @ApiProperty({
    description: "Thời gian dự kiến trả xe",
    example: "2025-11-02T09:00:00Z",
    required: false,
  })
  @IsOptional()
  @IsDateString()
  expected_return_datetime?: Date;

  @ApiProperty({
    description: "Thời gian thực tế trả xe (nếu đã trả)",
    example: "2025-11-01T16:30:00Z",
    required: false,
  })
  @IsOptional()
  @IsDateString()
  actual_return_datetime?: Date;

  @ApiProperty({
    description: "Trạng thái thuê xe",
    enum: RentalStatus,
    default: RentalStatus.RESERVED,
    example: RentalStatus.RESERVED,
  })
  @IsEnum(RentalStatus)
  @IsOptional()
  status?: RentalStatus;

  @ApiProperty({
    description: "Điểm đánh giá (1–5) nếu đã hoàn tất",
    example: 5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  score?: number | null;

  @ApiProperty({
    description: "Nhận xét của người thuê (nếu có)",
    example: "Xe chạy êm, nhân viên hỗ trợ tốt",
    required: false,
  })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty({
    description: "Thời điểm người dùng đánh giá",
    example: "2025-11-03T08:00:00Z",
    required: false,
  })
  @IsOptional()
  @IsDateString()
  rated_at?: Date;
}
