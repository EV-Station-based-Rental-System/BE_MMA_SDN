import { User } from "src/models/user.schema";
import { Renter } from "src/models/renter.schema";
import { Staff } from "src/models/staff.schema";
import { Admin } from "src/models/admin.schema";

/**
 * Base JWT payload representing a User document with _id
 */
export type BaseJwtUserPayload = Pick<User, "email" | "full_name" | "role"> & {
  _id: string;
};

/**
 * JWT payload for Renter role - combines User fields with Renter-specific fields
 */
export type RenterJwtUserPayload = BaseJwtUserPayload & Pick<Renter, "driver_license_no" | "address" | "date_of_birth" | "risk_score">;

/**
 * JWT payload for Staff role - combines User fields with Staff-specific fields
 */
export type StaffJwtUserPayload = BaseJwtUserPayload & Pick<Staff, "employee_code" | "position" | "hire_date">;

/**
 * JWT payload for Admin role - combines User fields with Admin-specific fields
 */
export type AdminJwtUserPayload = BaseJwtUserPayload & Pick<Admin, "title" | "notes" | "hire_date">;

export type FilterField = {
  field: string;
  type?: "string" | "number" | "date" | "boolean";
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
  [key: string]: any;
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
