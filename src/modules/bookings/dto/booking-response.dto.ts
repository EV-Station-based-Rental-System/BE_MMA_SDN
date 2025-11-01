import { ApiProperty } from "@nestjs/swagger";
import { BookingStatus, BookingVerificationStatus } from "src/common/enums/booking.enum";
import { FeeType } from "src/common/enums/fee.enum";
import { PaymentMethod, PaymentStatus } from "src/common/enums/payment.enum";
import { Role } from "src/common/enums/role.enum";

export class UserInResponse {
  @ApiProperty({ example: "6901a99d315708186850886c" })
  _id: string;

  @ApiProperty({ example: "ttei8191@gmail.com" })
  email: string;

  @ApiProperty({ example: "123123123" })
  password: string;

  @ApiProperty({ example: "Chấn" })
  full_name: string;

  @ApiProperty({ enum: Role, example: Role.RENTER })
  role: string;

  @ApiProperty({ example: true })
  is_active: boolean;

  @ApiProperty({ example: "2025-10-29T05:43:57.595Z" })
  created_at: Date;

  @ApiProperty({ example: 0 })
  __v: number;
}

export class RenterInResponse {
  @ApiProperty({ example: "6901a99d315708186850886e" })
  _id: string;

  @ApiProperty({ example: "6901a99d315708186850886c" })
  user_id: string;

  @ApiProperty({ example: "123456789" })
  address?: string;

  @ApiProperty({ example: "2004-12-28T00:00:00.000Z" })
  date_of_birth?: Date;

  @ApiProperty({ example: 0 })
  risk_score?: number;

  @ApiProperty({ example: "2025-10-29T05:43:57.677Z" })
  created_at: Date;

  @ApiProperty({ example: 0 })
  __v: number;

  @ApiProperty({ type: UserInResponse })
  user: UserInResponse;
}

export class StaffInResponse {
  @ApiProperty({ example: "6901a76d8e3f7ff9736ecbb6" })
  _id: string;

  @ApiProperty({ example: "6901a76d8e3f7ff9736ecbb4" })
  user_id: string;

  @ApiProperty({ example: "6901a7378e3f7ff9736ecbb0" })
  station_id: string;

  @ApiProperty({ example: "661446" })
  employee_code: string;

  @ApiProperty({ example: "Staff" })
  position: string;

  @ApiProperty({ example: "2025-10-29T05:34:37.128Z" })
  hire_date: Date;

  @ApiProperty({ example: "2025-10-29T05:34:37.129Z" })
  created_at: Date;

  @ApiProperty({ example: 0 })
  __v: number;

  @ApiProperty({ type: UserInResponse })
  user: UserInResponse;
}

export class PaymentInResponse {
  @ApiProperty({ example: "69035fca16c1c4f90ca908bf" })
  _id: string;

  @ApiProperty({ example: "69035fca16c1c4f90ca908b8" })
  booking_id: string;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.CASH })
  method: string;

  @ApiProperty({ enum: PaymentStatus, example: PaymentStatus.PENDING })
  status: string;

  @ApiProperty({ example: 2000000 })
  amount_paid: number;

  @ApiProperty({ example: "CASH_1761828810317" })
  transaction_code?: string;

  @ApiProperty({ example: "2025-10-30T12:53:30.555Z" })
  created_at: Date;

  @ApiProperty({ example: 0 })
  __v: number;
}

export class FeeInResponse {
  @ApiProperty({ example: "69035fca16c1c4f90ca908bb" })
  _id: string;

  @ApiProperty({ example: "69035fca16c1c4f90ca908b8" })
  booking_id: string;

  @ApiProperty({ enum: FeeType, example: FeeType.RENTAL_FEE })
  type: string;

  @ApiProperty({ example: "Rental fee for 2 days" })
  description?: string;

  @ApiProperty({ example: 1000000 })
  amount: number;

  @ApiProperty({ example: "VND" })
  currency: string;

  @ApiProperty({ example: "2025-10-30T12:53:30.442Z" })
  created_at: Date;

  @ApiProperty({ example: 0 })
  __v: number;
}

export class BookingListItemResponse {
  @ApiProperty({ example: "69035fca16c1c4f90ca908b8" })
  _id: string;

  @ApiProperty({ example: "6901a99d315708186850886e" })
  renter_id: string;

  @ApiProperty({ example: "69035f5716c1c4f90ca9089b" })
  vehicle_at_station_id: string;

  @ApiProperty({ example: "2025-10-30T10:00:00.000Z" })
  rental_start_datetime: Date;

  @ApiProperty({ example: "2025-11-01T10:00:00.000Z" })
  expected_return_datetime?: Date;

  @ApiProperty({ enum: BookingStatus, example: BookingStatus.VERIFIED })
  status: string;

  @ApiProperty({ enum: BookingVerificationStatus, example: BookingVerificationStatus.PENDING })
  verification_status: string;

  @ApiProperty({ example: 2000000 })
  total_booking_fee_amount: number;

  @ApiProperty({ example: 1000000 })
  deposit_fee_amount: number;

  @ApiProperty({ example: 1000000 })
  rental_fee_amount: number;

  @ApiProperty({ example: "2025-10-30T12:53:30.318Z" })
  created_at: Date;

  @ApiProperty({ example: 0 })
  __v: number;

  @ApiProperty({ type: RenterInResponse })
  renter: RenterInResponse;

  @ApiProperty({ type: StaffInResponse, required: false, description: "May be empty object if not yet verified" })
  verified_by_staff: StaffInResponse | Record<string, never>;

  @ApiProperty({ type: [PaymentInResponse] })
  payments: PaymentInResponse[];

  @ApiProperty({ type: [FeeInResponse] })
  fees: FeeInResponse[];

  @ApiProperty({ example: "2025-10-30T09:07:24.256Z", required: false })
  verified_at?: Date;

  @ApiProperty({ example: "6901a76d8e3f7ff9736ecbb6", required: false })
  verified_by_staff_id?: string;
}

export class BookingListMetaResponse {
  @ApiProperty({ example: 3 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  take: number;

  @ApiProperty({ example: 1 })
  totalPages: number;
}

export class BookingListResponse {
  @ApiProperty({ type: [BookingListItemResponse] })
  data: BookingListItemResponse[];

  @ApiProperty({ type: BookingListMetaResponse })
  meta: BookingListMetaResponse;
}
