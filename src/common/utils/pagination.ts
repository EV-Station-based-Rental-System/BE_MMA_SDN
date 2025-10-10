const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export interface PaginationOptions {
  page?: number;
  limit?: number;
  maxLimit?: number;
}

export interface NormalizedPagination {
  page: number;
  limit: number;
  skip: number;
}

export const normalizePagination = (options: PaginationOptions = {}): NormalizedPagination => {
  const page = Number.isFinite(options.page) ? Math.max(DEFAULT_PAGE, Number(options.page)) : DEFAULT_PAGE;
  const effectiveMaxLimit = options.maxLimit ?? MAX_LIMIT;
  const limitCandidate = Number.isFinite(options.limit) ? Math.max(1, Number(options.limit)) : DEFAULT_LIMIT;
  const limit = Math.min(limitCandidate, effectiveMaxLimit);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export const buildPaginationMeta = (total: number, pagination: NormalizedPagination): PaginationMeta => {
  const totalPages = pagination.limit === 0 ? 0 : Math.ceil(total / pagination.limit);
  return {
    total,
    page: pagination.page,
    limit: pagination.limit,
    totalPages,
  };
};
