import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBase64, IsOptional, IsString, Matches } from "class-validator";

export class DevUploadDto {
  @ApiPropertyOptional({ example: "selfie.jpg" })
  @IsOptional()
  @IsString()
  filename?: string;

  @ApiPropertyOptional({ example: "image/jpeg" })
  @IsOptional()
  @IsString()
  contentType?: string;

  @ApiPropertyOptional({ description: "Base64-encoded file (optional)" })
  @IsOptional()
  @IsBase64()
  base64?: string;

  @ApiPropertyOptional({ example: "https://example.com/path.jpg" })
  @IsOptional()
  @Matches(/^https?:\/\//, { message: "storage_url must be http(s) URL" })
  storage_url?: string;
}
