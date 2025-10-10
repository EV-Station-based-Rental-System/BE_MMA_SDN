import { IsString, IsDateString, IsOptional } from 'class-validator';
import { UserDto } from './user.dto';
import { ApiProperty } from '@nestjs/swagger';

export class RenterDto extends UserDto {
  @ApiProperty({
    description: 'Số giấy phép lái xe của người thuê',
    example: '123456789',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Số giấy phép lái xe phải là chuỗi' })
  driver_license_no?: string;

  @ApiProperty({
    description: 'Địa chỉ của người thuê',
    example: '123 Đường Láng, Hà Nội',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Địa chỉ phải là chuỗi' })
  address?: string;

  @ApiProperty({
    description: 'Ngày sinh của người thuê (định dạng ISO 8601)',
    example: '1990-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'Ngày sinh phải có định dạng hợp lệ (ISO 8601)' })
  date_of_birth?: string;
}
