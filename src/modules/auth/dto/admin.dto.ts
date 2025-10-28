import { ApiPropertyOptional } from "@nestjs/swagger";
import { UserDto } from "./user.dto";
import { IsString, IsOptional } from "class-validator";

export class AdminDto extends UserDto {
  @ApiPropertyOptional({ example: "Manager", description: "Your title" })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: "Some note", description: "Your note" })
  @IsOptional()
  @IsString()
  notes?: string;
}
