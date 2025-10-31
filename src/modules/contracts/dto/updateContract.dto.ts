import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateContractDto {
  @ApiProperty({
    description: "Nhãn mô tả cho file hợp đồng mới (ví dụ: Hợp đồng cập nhật, Hợp đồng sửa đổi, etc.)",
    example: "Hợp đồng cập nhật",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "Label phải là chuỗi" })
  label?: string;
}
