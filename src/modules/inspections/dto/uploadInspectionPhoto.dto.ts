import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId, IsNotEmpty, IsOptional, IsString, IsUrl } from "class-validator";

export class UploadInspectionPhotoDto {
  @ApiProperty({
    description: "ID của inspection",
    example: "inspection_id",
  })
  @IsMongoId()
  @IsNotEmpty()
  inspection_id: string;

  @ApiProperty({
    description: "URL của ảnh đã upload",
    example: "https://ik.imagekit.io/demo/vehicle/tire_front_left.jpg",
  })
  @IsUrl()
  @IsNotEmpty()
  url: string;

  @ApiProperty({
    description: "Nhãn mô tả ảnh (vị trí/bộ phận xe)",
    example: "tire_front_left",
    required: false,
  })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiProperty({
    description: "ID của report (nếu ảnh liên quan đến báo cáo hư hỏng)",
    example: "report_id",
    required: false,
  })
  @IsOptional()
  @IsMongoId()
  report_id?: string;
}
