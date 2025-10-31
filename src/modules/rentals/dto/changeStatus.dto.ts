import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";
import { RentalStatus } from "src/common/enums/rental.enum";

export class ChangeStatusDto {
  @ApiProperty({
    description: "Trạng thái mới của thuê xe",
    enum: RentalStatus,
    example: RentalStatus.RESERVED || RentalStatus.IN_PROGRESS || RentalStatus.COMPLETED || RentalStatus.LATE,
  })
  @IsEnum(RentalStatus)
  status: RentalStatus;
}
