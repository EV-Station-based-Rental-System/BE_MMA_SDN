import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString, MinLength } from "class-validator";
import { Role } from "src/common/enums/role.enum";
import { toBoolean } from "src/common/utils/helper";

export class CreateUserDto {
  @ApiProperty({ description: "Email address", example: "admin@example.com" })
  @IsEmail()
  email!: string;

  @ApiProperty({ description: "User password", minLength: 6, example: "Secret123" })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({ description: "Full name of the user", example: "Nguyen Van A" })
  @IsString()
  full_name!: string;

  @ApiProperty({ description: "Role assigned to the user", enum: Role, example: Role.ADMIN })
  @IsEnum(Role)
  role!: Role;

  @ApiPropertyOptional({ description: "Phone number", example: "0901234567" })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: "Active status", example: true })
  @IsOptional()
  @Transform(({ value }) => toBoolean(String(value)))
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}
