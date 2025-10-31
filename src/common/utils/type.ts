import { User } from "src/models/user.schema";
import { Renter } from "src/models/renter.schema";
import { Staff } from "src/models/staff.schema";
import { Admin } from "src/models/admin.schema";
import { Types } from "mongoose";
import { InspectionType } from "../enums/inspection.enum";
import { BookingStatus, BookingVerificationStatus } from "../enums/booking.enum";
import { RentalStatus } from "../enums/rental.enum";

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
export type UserInfo = {
  _id: string;
  email: string;
  full_name: string;
};
export type RenterInfo = {
  _id: string;
  address: string;
  date_of_birth: string;
  user: UserInfo;
};

export type StaffInfo = {
  _id: string;
  employee_code: string;
  position: string;
  user: UserInfo;
};

export type ReportPhotoInfo = {
  _id: string;
  url: string;
  label: string;
};

export type InspectionInfo = {
  _id: string;
  type: InspectionType.PRE_RENTAL | InspectionType.POST_RENTAL;
  inspected_at: string;
  current_battery_capacity_kwh: number;
  current_mileage: number;
  inspector: StaffInfo | null;
  report_photos: ReportPhotoInfo[];
};

export type BookingInfo = {
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
  renter: RenterInfo | null;
  verified_staff: StaffInfo | null;
};
export type ContractInfo = {
  _id: string;
  document_url: string;
};
export type ReturnRentalMapping = {
  _id: string;
  pickup_datetime: string;
  status: RentalStatus.RESERVED | RentalStatus.IN_PROGRESS | RentalStatus.COMPLETED | RentalStatus.LATE | RentalStatus.CANCELLED;
  created_at: string;
  booking: BookingInfo | null;
  inspections: InspectionInfo[];
  contract: ContractInfo | null;
};

export type RentalAggregateResult = {
  _id: string;
  pickup_datetime: string;
  status: RentalStatus.RESERVED | RentalStatus.IN_PROGRESS | RentalStatus.COMPLETED | RentalStatus.LATE | RentalStatus.CANCELLED;
  created_at: string;
  booking: {
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
    renter: {
      _id: string;
      address: string;
      date_of_birth: string;
      user: {
        _id: string;
        email: string;
        full_name: string;
      };
    };
    verified_staff: {
      _id: string;
      employee_code: string;
      position: string;
      user: {
        _id: string;
        email: string;
        full_name: string;
      };
    };
  };

  inspections: {
    _id: string;
    type: InspectionType.POST_RENTAL | InspectionType.PRE_RENTAL;
    inspected_at: string;
    current_battery_capacity_kwh: number;
    current_mileage: number;
    inspector: {
      _id: string;
      employee_code: string;
      position: string;
      user: {
        _id: string;
        email: string;
        full_name: string;
      };
    };
    report_photos: {
      _id: string;
      url: string;
      label: string;
    }[];
  }[];
  contract?: {
    _id: string;
    document_url: string;
  };
};
