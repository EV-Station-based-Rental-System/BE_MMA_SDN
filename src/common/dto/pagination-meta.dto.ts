import { ApiProperty } from "@nestjs/swagger";

export class PaginationMetaDto {
  @ApiProperty({ description: "Total number of records", example: 120 })
  total: number;

  @ApiProperty({ description: "Current page number", example: 1 })
  page: number;

  @ApiProperty({ description: "Number of records per page", example: 20 })
  limit: number;

  @ApiProperty({ description: "Total number of pages", example: 6 })
  totalPages: number;
}
