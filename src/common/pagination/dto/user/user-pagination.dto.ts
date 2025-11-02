import { IsBoolean, IsOptional, IsString } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { BasePaginationDto } from "../basePagination.dto";

import { Transform } from "class-transformer";
import { toBoolean } from "src/common/utils/helper";
import { KycStatus } from "src/common/enums/kyc.enum";

export class UserPaginationDto extends BasePaginationDto {
  @ApiPropertyOptional({
    description: "Search term to filter results",
    example: "email |full_name | phone_number",
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: "Field to sort by",
    example: "created_at | full_name | email | phone_number",
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({
    enum: KycStatus,
    example: KycStatus.SUBMITTED,
  })
  @IsOptional()
  @IsString()
  statusKyc?: string;

  @IsOptional()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  is_active?: boolean;
}
