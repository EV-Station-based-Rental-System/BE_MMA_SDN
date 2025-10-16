import { Admin, AdminSchema } from "./admin.schema";
import { Renter, RenterSchema } from "./renter.schema";
import { Staff, StaffSchema } from "./staff.schema";
import { User, UserSchema } from "./user.schema";
import { Booking, BookingSchema } from "./booking.schema";
import { Contract, ContractSchema } from "./contract.schema";
import { Fee, feeSchema } from "./fee.schema";
import { Inspection, InspectionSchema } from "./inspections.schema";
import { Kycs, KycsSchema } from "./kycs.schema";
import { Payment, PaymentSchema } from "./payment.schema";
import { Pricing, PricingSchema } from "./pricings.schema";
import { Rental, RentalSchema } from "./rental.schema";
import { Report, ReportSchema } from "./report.schema";
import { ReportsPhoto, ReportsPhotoSchema } from "./reports_photo.schema";;
import { StaffAtStation, StaffAtStationSchema } from "./staff_at_station.schema";
import { StaffTransfer, StaffTransferSchema } from "./staff_transfer.schema";
import { Station, StationSchema } from "./station.schema";
import { VehicleAtStation, VehicleAtStationSchema } from "./vehicle_at_station.schema";
import { Vehicle, VehicleSchema } from "./vehicle.schema";
import { VehicleTransfer, VehicleTransferSchema } from "./vehicle_transfer.schema";

export const index = [
  { name: User.name, schema: UserSchema },
  { name: Admin.name, schema: AdminSchema },
  { name: Staff.name, schema: StaffSchema },
  { name: Renter.name, schema: RenterSchema },
  { name: Booking.name, schema: BookingSchema },
  { name: Contract.name, schema: ContractSchema },
  { name: Fee.name, schema: feeSchema },
  { name: Inspection.name, schema: InspectionSchema },
  { name: Kycs.name, schema: KycsSchema },
  { name: Payment.name, schema: PaymentSchema },
  { name: Pricing.name, schema: PricingSchema },
  { name: Rental.name, schema: RentalSchema },
  { name: Report.name, schema: ReportSchema },
  { name: ReportsPhoto.name, schema: ReportsPhotoSchema },
  { name: StaffAtStation.name, schema: StaffAtStationSchema },
  { name: StaffTransfer.name, schema: StaffTransferSchema },
  { name: Station.name, schema: StationSchema },
  { name: VehicleAtStation.name, schema: VehicleAtStationSchema },
  { name: VehicleTransfer.name, schema: VehicleTransferSchema },
  { name: Vehicle.name, schema: VehicleSchema },
];
