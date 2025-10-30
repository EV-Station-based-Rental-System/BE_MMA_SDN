import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsMongoId, IsOptional } from "class-validator";

export class CreateContractDto {
  @ApiProperty({
    description: "ID của rental (thuê xe)",
    example: "507f1f77bcf86cd799439011",
    required: true,
  })
  @IsNotEmpty({ message: "Rental ID không được để trống" })
  @IsString({ message: "Rental ID phải là chuỗi" })
  @IsMongoId({ message: "Rental ID phải là MongoDB ObjectId hợp lệ" })
  rental_id: string;

  @ApiProperty({
    description: "Nhãn mô tả cho file hợp đồng (ví dụ: Hợp đồng của anh Chấn, Hợp đồng tháng 10, etc.)",
    example: "Hợp đồng của anh Chấn",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "Label phải là chuỗi" })
  label?: string;
}
