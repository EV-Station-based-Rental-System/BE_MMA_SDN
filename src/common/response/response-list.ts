
import { MetaOptions } from "../utils/type";

export class ResponseList<T> {
  data: T[];

  meta: Record<string, any>;

  constructor(data: T[], meta: MetaOptions) {
    this.data = data;
    const { total, page, take, totalSuccess, totalFailed, totalPending, ...rest } = meta;

    this.meta = {
      total,
      page,
      take,
      totalPages: Math.ceil(total / take),
      ...(totalSuccess !== undefined && { totalSuccess }),
      ...(totalFailed !== undefined && { totalFailed }),
      ...(totalPending !== undefined && { totalPending }),
      ...rest,
    };
  }

  static ok<T>(buildPaginationResponse: { data: T[]; meta: MetaOptions }) {
    const { data, meta } = buildPaginationResponse;
    return new ResponseList<T>(data, meta);
  }
}
