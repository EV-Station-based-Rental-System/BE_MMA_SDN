import { ApiProperty } from "@nestjs/swagger";
import { MetaOptions } from "../utils/type";

export class ResponseList<T> {
  @ApiProperty({ example: [], nullable: true })
  data: T[];

  @ApiProperty({
    example: {
      total: 100,
      page: 1,
      take: 10,
      totalPages: 10,
    },
  })
  meta: Record<string, any>;

  constructor(data: T[], meta: MetaOptions) {
    this.data = data;
    const { total, page, take, totalSuccess, totalFailed, totalPending, revenue, ...rest } = meta;

    this.meta = {
      total,
      page,
      take,
      totalPages: Math.ceil(total / take),
      ...(totalSuccess !== undefined && { totalSuccess }),
      ...(totalFailed !== undefined && { totalFailed }),
      ...(totalPending !== undefined && { totalPending }),
      ...(revenue !== undefined && { revenue: parseFloat(revenue.toString()) }),
      ...rest,
    };
  }

  static ok<T>(buildPaginationResponse: { data: T[]; meta: MetaOptions }) {
    const { data, meta } = buildPaginationResponse;
    return new ResponseList<T>(data, meta);
  }
}
