import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsDateString } from "class-validator";
import { InspectionType } from "src/common/enums/inspection.enum";

export class CreateInspectionDto {
  @ApiProperty({
    description: "ID của rental đang được kiểm tra",
    example: "rental_id",
  })
  @IsMongoId()
  @IsNotEmpty()
  rental_id: string;

  @ApiProperty({
    description: "Loại kiểm tra: pre_rental hoặc post_rental",
    enum: InspectionType,
    example: InspectionType.PRE_RENTAL,
  })
  @IsEnum(InspectionType)
  @IsNotEmpty()
  type: InspectionType;

  @ApiProperty({
    description: "Thời điểm kiểm tra (mặc định là hiện tại)",
    example: "2025-10-28T10:00:00Z",
    required: false,
  })
  @IsOptional()
  @IsDateString()
  inspected_at?: Date;

  @ApiProperty({
    description: "Dung lượng pin hiện tại (kWh)",
    example: 45.5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  current_battery_capacity_kwh?: number;

  @ApiProperty({
    description: "Số km hiện tại của xe",
    example: 15000,
  })
  @IsNumber()
  @IsNotEmpty()
  current_mileage: number;
}
