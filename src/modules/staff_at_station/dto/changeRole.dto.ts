import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ChangeRoleDto {
  @ApiProperty({
    description: 'New role of the staff at the station',
    example: 'maintenance_staff',
  })
  @IsString({ message: 'role_at_station must be a string' })
  @IsNotEmpty({ message: 'role_at_station is required' })
  role_at_station: string;
}
