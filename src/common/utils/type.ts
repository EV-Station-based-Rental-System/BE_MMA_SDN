import { User } from "src/models/user.schema";
import { Renter } from "src/models/renter.schema";
import { Staff } from "src/models/staff.schema";
import { Admin } from "src/models/admin.schema";
import { Types } from "mongoose";
import { InspectionType } from "../enums/inspection.enum";
import { BookingStatus, BookingVerificationStatus } from "../enums/booking.enum";
import { RentalStatus } from "../enums/rental.enum";
import { ApiProperty } from "@nestjs/swagger";

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
export class UserInfo {
  @ApiProperty({ example: "6901a99d315708186850886c" })
  _id: string;

  @ApiProperty({ example: "ttei8191@gmail.com" })
  email: string;

  @ApiProperty({ example: "Chấn" })
  full_name: string;
}

export class RenterInfo {
  @ApiProperty({ example: "6901a99d315708186850886e" })
  _id: string;

  @ApiProperty({ example: "123456789" })
  address: string;

  @ApiProperty({ example: "2004-12-28T00:00:00.000Z" })
  date_of_birth: string;

  @ApiProperty({ type: () => UserInfo })
  user: UserInfo;
}

export class StaffInfo {
  @ApiProperty({ example: "6901a76d8e3f7ff9736ecbb6" })
  _id: string;

  @ApiProperty({ example: "661446" })
  employee_code: string;

  @ApiProperty({ example: "Staff" })
  position: string;

  @ApiProperty({ type: () => UserInfo })
  user: UserInfo;
}

export class ReportPhotoInfo {
  @ApiProperty({ example: "report_photo_id_123" })
  _id: string;

  @ApiProperty({ example: "https://example.com/photo.jpg" })
  url: string;

  @ApiProperty({ example: "Pre-rental inspection photo" })
  label: string;
}

export class InspectionInfo {
  @ApiProperty({ example: "inspection_id_123" })
  _id: string;

  @ApiProperty({ enum: InspectionType, example: InspectionType.PRE_RENTAL })
  type: InspectionType.PRE_RENTAL | InspectionType.POST_RENTAL;

  @ApiProperty({ example: "2025-10-30T09:07:24.256Z" })
  inspected_at: string;

  @ApiProperty({ example: 75 })
  current_battery_capacity_kwh: number;

  @ApiProperty({ example: 5000 })
  current_mileage: number;

  @ApiProperty({ type: () => StaffInfo, nullable: true })
  inspector: StaffInfo | null;

  @ApiProperty({ type: () => [ReportPhotoInfo] })
  report_photos: ReportPhotoInfo[];
}

export class BookingInfo {
  @ApiProperty({ example: "690329d529814937d93daef8" })
  _id: string;

  @ApiProperty({ example: "2025-10-30T10:00:00.000Z" })
  rental_start_datetime: string;

  @ApiProperty({ example: "2025-11-01T10:00:00.000Z" })
  expected_return_datetime: string;

  @ApiProperty({ enum: BookingStatus, example: BookingStatus.VERIFIED })
  status: BookingStatus.PENDING_VERIFICATION | BookingStatus.VERIFIED | BookingStatus.CANCELLED;

  @ApiProperty({ enum: BookingVerificationStatus, example: BookingVerificationStatus.APPROVED })
  verification_status:
    | BookingVerificationStatus.APPROVED
    | BookingVerificationStatus.PENDING
    | BookingVerificationStatus.REJECTED_MISMATCH
    | BookingVerificationStatus.REJECTED_OTHER;

  @ApiProperty({ example: 2000000 })
  total_booking_fee_amount: number;

  @ApiProperty({ example: 1000000 })
  deposit_fee_amount: number;

  @ApiProperty({ example: 1000000 })
  rental_fee_amount: number;

  @ApiProperty({ example: "2025-10-30T09:07:24.256Z" })
  verified_at: string;

  @ApiProperty({ type: () => RenterInfo, nullable: true })
  renter: RenterInfo | null;

  @ApiProperty({ type: () => StaffInfo, nullable: true })
  verified_staff: StaffInfo | null;
}

export class ContractInfo {
  @ApiProperty({ example: "contract_id_123" })
  _id: string;

  @ApiProperty({ example: "https://example.com/contract.pdf" })
  document_url: string;
}

export class ReturnRentalMapping {
  @ApiProperty({ example: "69032acce31073a40b87002c" })
  _id: string;

  @ApiProperty({ example: "2025-10-30T09:07:24.256Z" })
  pickup_datetime: string;

  @ApiProperty({ enum: RentalStatus, example: RentalStatus.RESERVED })
  status: RentalStatus.RESERVED | RentalStatus.IN_PROGRESS | RentalStatus.COMPLETED | RentalStatus.LATE | RentalStatus.CANCELLED;

  @ApiProperty({ example: "2025-10-30T09:07:24.259Z" })
  created_at: string;

  @ApiProperty({ type: () => BookingInfo, nullable: true })
  booking: BookingInfo | null;

  @ApiProperty({ type: () => [InspectionInfo] })
  inspections: InspectionInfo[];

  @ApiProperty({ type: () => ContractInfo, nullable: true })
  contract: ContractInfo | null;
}

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
