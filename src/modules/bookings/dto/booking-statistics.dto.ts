import { IsEnum, IsInt, IsOptional, Max, Min } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export enum StatisticsPeriod {
  DAY = "day",
  WEEK = "week",
  MONTH = "month",
}

export class BookingStatisticsDto {
  @ApiProperty({
    description: "Period for statistics (day, week, month)",
    enum: StatisticsPeriod,
    example: StatisticsPeriod.MONTH,
  })
  @IsEnum(StatisticsPeriod)
  period: StatisticsPeriod;

  @ApiProperty({
    description: "Year for statistics",
    example: 2025,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2020)
  @Max(2100)
  year?: number;

  @ApiProperty({
    description: "Month for statistics (1-12), required for day/week period",
    example: 11,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;
}

export class MonthlyRevenueDto {
  @ApiProperty({
    description: "Year for revenue statistics",
    example: 2025,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2020)
  @Max(2100)
  year?: number;
}
