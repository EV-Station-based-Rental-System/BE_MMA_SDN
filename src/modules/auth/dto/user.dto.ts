import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsEnum, IsOptional } from 'class-validator';
import { Role } from 'src/common/enums/role.enum';

// DTO để tạo người dùng mới
export class UserDto {
  @ApiProperty({
    description: 'Email của người dùng',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @ApiProperty({
    description: 'Mật khẩu của người dùng (đã mã hóa)',
    example: 'hashed_password_here',
  })
  @IsString({ message: 'Mật khẩu phải là chuỗi' })
  password_hash: string;

  @ApiProperty({
    description: 'Họ và tên đầy đủ của người dùng',
    example: 'Nguyen Van A',
  })
  @IsString({ message: 'Họ và tên phải là chuỗi' })
  full_name: string;

  @ApiProperty({
    description: 'Vai trò của người dùng',
    enum: Role,
    example: Role.RENTER,
  })
  @IsEnum(Role, { message: 'Vai trò không hợp lệ' })
  role: Role;

  @ApiProperty({
    description: 'Số điện thoại của người dùng (không bắt buộc)',
    example: '0123456789',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Số điện thoại phải là chuỗi' })
  phone?: string;
}
