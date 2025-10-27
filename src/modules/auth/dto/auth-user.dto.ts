import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsEmail, IsOptional, MinLength, IsNotEmpty } from "class-validator";

export class UserDto {
  @ApiProperty({
    example: "user@example.com",
  })
  @IsEmail({}, { message: "Invalid email" })
  email: string;

  @ApiProperty({
    example: "your password",
  })
  @IsString()
  @IsNotEmpty({ message: "Password must not be empty" })
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  password: string;

  @ApiProperty({
    example: "Nguyen Van A",
  })
  @IsString({ message: "Full name must be a string" })
  full_name: string;

  @ApiProperty({
    description: "Your phone number (optional)",
    example: "0123456789",
    required: false,
  })
  @IsOptional()
  @IsString({ message: "Phone number must be a string" })
  phone?: string;
}
