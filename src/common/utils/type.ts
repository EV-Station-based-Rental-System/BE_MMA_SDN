export type BaseJwtUserPayload = {
  _id: string;
  email: string;
  fullName: string;
  role: string;
};

export type RenterJwtUserPayload = BaseJwtUserPayload & {
  driver_license_no?: string;
  address?: string;
  date_of_birth?: Date;
  risk_score?: number;
};

export type StaffJwtUserPayload = BaseJwtUserPayload & {
  employee_code: string;
  position: string;
  hire_date: Date;
};

export type AdminJwtUserPayload = BaseJwtUserPayload & {
  title?: string;
  notes?: string;
  hire_date: Date;
};

export type FilterField = {
  field: string;
  type?: 'string' | 'number' | 'date' | 'boolean';
  customWhere?: (value: any) => void;
};

export type PaginationParams = {
  page: number;
  take: number;
};

export type MetaOptions = {
  total: number;
  page: number;
  take: number;
  totalSuccess?: number;
  totalFailed?: number;
  totalPending?: number;
  revenue?: string | number;
  [key: string]: any;
  // totalMovieAvailable?: number;
  // totalMovieDeleted?: number;
};

export type FacetResult<T> = {
  data: T[];
  meta: { total: number }[];
}[];

export type ToNumberOptions = {
  default?: number;
  min?: number;
  max?: number;
};
