import { User } from "src/models/user.schema";
import { Renter } from "src/models/renter.schema";
import { Staff } from "src/models/staff.schema";
import { Admin } from "src/models/admin.schema";
import { InspectionType } from "../enums/inspection.enum";
import { BookingStatus, BookingVerificationStatus } from "../enums/booking.enum";
import { RentalStatus } from "../enums/rental.enum";
import { VehicleStatus } from "../enums/vehicle.enum";
import { PaymentMethod } from "../enums/payment.enum";

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

// ==== Station ====
export type StationEntity = {
  _id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  is_active: boolean;
};

// ==== Vehicle ====
export type VehicleAggregateResult = {
  _id: string;
  make: string;
  model: string;
  model_year: number;
  category: string;
  battery_capacity_kwh?: number;
  range_km?: number;
  vin_number?: string;
  license_plate: string;
  img_url?: string;
  is_active: boolean;
  current_battery_capacity_kwh?: number;
  current_mileage?: number;
  status: VehicleStatus;
  price_per_hour: number;
  price_per_day: number;
  deposit_amount: number;
  station?: StationEntity;
};

export type VehicleEntity = {
  _id: string;
  make: string;
  model: string;
  model_year: number;
  category: string;
  battery_capacity_kwh?: number;
  range_km?: number;
  vin_number?: string;
  license_plate: string;
  img_url?: string;
  is_active: boolean;
  current_battery_capacity_kwh?: number;
  current_mileage?: number;
  status: string;
  price_per_hour: number;
  price_per_day: number;
  deposit_amount: number;
  station: StationEntity | null;
};

export type VehicleResponse = {
  vehicle: VehicleEntity;
};

// ==== User & Renter ====
export type UserEntity = {
  _id: string;
  email: string;
  full_name: string;
};

export type RenterEntity = {
  _id: string;
  address: string;
  date_of_birth: string;
  user: UserEntity;
};

// ==== Staff ====
export type StaffEntity = {
  _id: string;
  employee_code: string;
  position: string;
  user: UserEntity;
};

// ==== Inspection ====
export type ReportPhotoEntity = {
  _id: string;
  url: string;
  label: string;
};

export type InspectionEntity = {
  _id: string;
  type: InspectionType.PRE_RENTAL | InspectionType.POST_RENTAL;
  inspected_at: string;
  current_battery_capacity_kwh: number;
  current_mileage: number;
  inspector: StaffEntity | null;
  report_photos: ReportPhotoEntity[];
};

// ==== Pricing ====
export type PricingEntity = {
  _id: string;
  price_per_hour: number;
  price_per_day: number;
  effective_from: string;
  effective_to: string | null;
  deposit_amount: number;
  late_return_fee_per_hour: number;
  mileage_limit_per_day: number;
  excess_mileage_fee: number;
};

// ==== Vehicle for Rental ====
export type VehicleRentalInfo = {
  _id: string;
  make: string;
  model: string;
  model_year: number;
  price_per_hour: number;
  price_per_day: number;
  deposit_amount: number;
  station: StationEntity | null;
};

// ==== Booking ====
export type FeeEntity = {
  _id: string;
  type: string;
  description: string;
  amount: number;
};

export type PaymentEntity = {
  _id: string;
  method: PaymentMethod;
  amount_paid: number;
  transaction_code: string;
};

export type BookingEntity = {
  _id: string;
  rental_start_datetime: string;
  expected_return_datetime: string;
  status: BookingStatus.PENDING_VERIFICATION | BookingStatus.VERIFIED | BookingStatus.CANCELLED;
  verification_status:
    | BookingVerificationStatus.APPROVED
    | BookingVerificationStatus.PENDING
    | BookingVerificationStatus.REJECTED_MISMATCH
    | BookingVerificationStatus.REJECTED_OTHER;
  total_booking_fee_amount: number;
  deposit_fee_amount: number;
  rental_fee_amount: number;
  verified_at: string;
  renter: RenterEntity | null;
  verified_staff: StaffEntity | null;
  vehicle: VehicleRentalInfo | null;
};

export type BookingAggregateResult = {
  _id: string;
  rental_start_datetime: Date;
  expected_return_datetime: Date;
  status: BookingStatus;
  verification_status: BookingVerificationStatus;
  total_booking_fee_amount: number;
  deposit_fee_amount: number;
  rental_fee_amount: number;
  renter: RenterEntity | null;
  verified_staff: StaffEntity | null;
  payment: PaymentEntity | null;
  fee: FeeEntity[];
  vehicle: VehicleRentalInfo | null;
};

// ==== Rental ====
export type ContractEntity = {
  _id: string;
  document_url: string;
};

export type RentalEntity = {
  _id: string;
  pickup_datetime: string;
  status: RentalStatus.RESERVED | RentalStatus.IN_PROGRESS | RentalStatus.COMPLETED | RentalStatus.LATE | RentalStatus.CANCELLED;
  created_at: string;
  booking: BookingEntity | null;
  inspections: InspectionEntity[];
  contract: ContractEntity | null;
};

export type RentalAggregateResult = {
  _id: string;
  pickup_datetime: string;
  status: RentalStatus.RESERVED | RentalStatus.IN_PROGRESS | RentalStatus.COMPLETED | RentalStatus.LATE | RentalStatus.CANCELLED;
  created_at: string;
  booking: BookingEntity;
  inspections: InspectionEntity[];
  contract: ContractEntity | null;
};
