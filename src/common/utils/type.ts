import { User } from "src/models/user.schema";
import { Renter } from "src/models/renter.schema";
import { Staff } from "src/models/staff.schema";
import { Admin } from "src/models/admin.schema";
import { Types } from "mongoose";

export type BaseJwtUserPayload = Pick<User, "email" | "full_name" | "role"> & {
  _id: string;
};

export type RenterJwtUserPayload = BaseJwtUserPayload & Pick<Renter, "address" | "date_of_birth" | "risk_score">;

export type StaffJwtUserPayload = BaseJwtUserPayload & Pick<Staff, "employee_code" | "position" | "hire_date">;

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

export type VehicleInfo = {
  _id: Types.ObjectId;
  make: string;
  model: string;
  model_year: number;
  category: string;
  price_rental_per_day: number;
  fee_deposit: number;
  battery_capacity_kwh: number;
  range_km: number;
  vin_number: string;
  is_active: boolean;
};

export type StationInfo = {
  _id: Types.ObjectId;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  is_active: boolean;
};

export type PricingInfo = {
  _id: Types.ObjectId;
  price_per_hour: number;
  price_per_day: number;
  effective_from: Date;
  effective_to: Date | null;
  deposit_amount: number;
  late_return_fee_per_hour: number;
  mileage_limit_per_day: number;
  excess_mileage_fee: number;
};

export type VehicleAtStationResponse = {
  _id: Types.ObjectId;
  current_battery_capacity_kwh: number;
  current_mileage: number;
  status: string;
  start_time: Date;
  end_time?: Date;
  vehicle: VehicleInfo | null;
  station: StationInfo | null;
  pricing: PricingInfo | null;
};

export type VehicleAtStationAggregateResult = {
  _id: Types.ObjectId;
  current_battery_capacity_kwh: number;
  current_mileage: number;
  status: string;
  start_time: Date;
  end_time?: Date;
  vehicle?: {
    _id: Types.ObjectId;
    make: string;
    model: string;
    model_year: number;
    category: string;
    price_rental_per_day: number;
    fee_deposit: number;
    battery_capacity_kwh: number;
    range_km: number;
    vin_number: string;
    is_active: boolean;
  };
  station?: {
    _id: Types.ObjectId;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    is_active: boolean;
  };
  pricing?: {
    _id: Types.ObjectId;
    price_per_hour: number;
    price_per_day: number;
    effective_from: Date;
    effective_to: Date | null;
    deposit_amount: number;
    late_return_fee_per_hour: number;
    mileage_limit_per_day: number;
    excess_mileage_fee: number;
  };
};
