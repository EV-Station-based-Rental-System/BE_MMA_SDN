import { IsString, IsDateString } from 'class-validator';
import { UserDto } from './user.dto';
import { ApiProperty } from '@nestjs/swagger';

// DTO để tạo người thuê (Renter) mới
export class RenterDto extends UserDto {
  @ApiProperty({
    description: 'Số giấy phép lái xe của người thuê',
    example: '123456789',
  })
  @IsString({ message: 'Số giấy phép lái xe phải là chuỗi' })
  driver_license: string;

  @ApiProperty({
    description: 'Địa chỉ của người thuê',
    example: '123 Đường Láng, Hà Nội',
  })
  @IsString({ message: 'Địa chỉ phải là chuỗi' })
  address: string;

  @ApiProperty({
    description: 'Ngày sinh của người thuê (định dạng ISO 8601)',
    example: '1990-01-01',
  })
  @IsDateString({}, { message: 'Ngày sinh phải có định dạng hợp lệ (ISO 8601)' })
  date_of_birth: string;
}
