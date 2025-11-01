import { faker } from "@faker-js/faker";
import mongoose from "mongoose";

import * as dotenv from "dotenv";
dotenv.config();

import "tsconfig-paths/register";
import { Role } from "../src/common/enums/role.enum";
import { BookingStatus, BookingVerificationStatus } from "../src/common/enums/booking.enum";
import { PaymentMethod, PaymentStatus } from "../src/common/enums/payment.enum";
import { RentalStatus } from "../src/common/enums/rental.enum";
import { VehicleStatus } from "../src/common/enums/vehicle.enum";
import { FeeType } from "../src/common/enums/fee.enum";
import { InspectionType } from "../src/common/enums/inspection.enum";
import { KycStatus, KycType } from "../src/common/enums/kyc.enum";
import { User, UserSchema } from "../src/models/user.schema";
import { Admin, AdminSchema } from "../src/models/admin.schema";
import { Staff, StaffSchema } from "../src/models/staff.schema";
import { Renter, RenterSchema } from "../src/models/renter.schema";
import { Vehicle, VehicleSchema } from "../src/models/vehicle.schema";
import { Station, StationSchema } from "../src/models/station.schema";
import { Booking, BookingSchema } from "../src/models/booking.schema";
import { Rental, RentalSchema } from "../src/models/rental.schema";
import { Payment, PaymentSchema } from "../src/models/payment.schema";
import { Fee, FeeSchema } from "../src/models/fee.schema";
import { Pricing, PricingSchema } from "../src/models/pricings.schema";
import { Kycs, KycsSchema } from "../src/models/kycs.schema";
import { Inspection, InspectionSchema } from "../src/models/inspections.schema";
import { Report, ReportSchema } from "../src/models/report.schema";
import { ReportsPhoto, ReportsPhotoSchema } from "../src/models/reports_photo.schema";
import { Contract, ContractSchema } from "../src/models/contract.schema";

interface MockDataIds {
  users: mongoose.Types.ObjectId[];
  admins: mongoose.Types.ObjectId[];
  staff: mongoose.Types.ObjectId[];
  renters: mongoose.Types.ObjectId[];
  stations: mongoose.Types.ObjectId[];
  vehicles: mongoose.Types.ObjectId[];
  bookings: mongoose.Types.ObjectId[];
  rentals: mongoose.Types.ObjectId[];
  payments: mongoose.Types.ObjectId[];
  fees: mongoose.Types.ObjectId[];
  pricings: mongoose.Types.ObjectId[];
  kycs: mongoose.Types.ObjectId[];
  inspections: mongoose.Types.ObjectId[];
  reports: mongoose.Types.ObjectId[];
  reportsPhotos: mongoose.Types.ObjectId[];
  contracts: mongoose.Types.ObjectId[];
}

interface BookingMeta {
  renterId: mongoose.Types.ObjectId;
  vehicleId: mongoose.Types.ObjectId;
  start: Date;
  expectedReturn: Date;
  status: BookingStatus;
  verificationStatus: BookingVerificationStatus;
  totalFee: number;
  depositFee: number;
  rentalFee: number;
}

interface RentalMeta {
  bookingId: mongoose.Types.ObjectId;
  vehicleId: mongoose.Types.ObjectId;
  pickup: Date;
  expectedReturn: Date;
  actualReturn?: Date;
  status: RentalStatus;
}

interface InspectionMeta {
  rentalId: mongoose.Types.ObjectId;
  inspectedAt: Date;
  type: InspectionType;
}

interface VehicleMetrics {
  battery: number;
  mileage: number;
}

class MockDataGenerator {
  private readonly ids: MockDataIds = {
    users: [],
    admins: [],
    staff: [],
    renters: [],
    stations: [],
    vehicles: [],
    bookings: [],
    rentals: [],
    payments: [],
    fees: [],
    pricings: [],
    kycs: [],
    inspections: [],
    reports: [],
    reportsPhotos: [],
    contracts: [],
  };

  private readonly userRoleMap = new Map<string, Role>();
  private readonly bookingMeta = new Map<string, BookingMeta>();
  private readonly rentalMeta = new Map<string, RentalMeta>();
  private readonly inspectionMeta = new Map<string, InspectionMeta>();
  private readonly reportByInspection = new Map<string, mongoose.Types.ObjectId>();
  private readonly vehicleMetrics = new Map<string, VehicleMetrics>();

  private readonly UserModel = (mongoose.models[User.name] as mongoose.Model<User>) || mongoose.model<User>(User.name, UserSchema);
  private readonly AdminModel = (mongoose.models[Admin.name] as mongoose.Model<Admin>) || mongoose.model<Admin>(Admin.name, AdminSchema);
  private readonly StaffModel = (mongoose.models[Staff.name] as mongoose.Model<Staff>) || mongoose.model<Staff>(Staff.name, StaffSchema);
  private readonly RenterModel = (mongoose.models[Renter.name] as mongoose.Model<Renter>) || mongoose.model<Renter>(Renter.name, RenterSchema);
  private readonly VehicleModel = (mongoose.models[Vehicle.name] as mongoose.Model<Vehicle>) || mongoose.model<Vehicle>(Vehicle.name, VehicleSchema);
  private readonly StationModel = (mongoose.models[Station.name] as mongoose.Model<Station>) || mongoose.model<Station>(Station.name, StationSchema);
  private readonly BookingModel = (mongoose.models[Booking.name] as mongoose.Model<Booking>) || mongoose.model<Booking>(Booking.name, BookingSchema);
  private readonly RentalModel = (mongoose.models[Rental.name] as mongoose.Model<Rental>) || mongoose.model<Rental>(Rental.name, RentalSchema);
  private readonly PaymentModel = (mongoose.models[Payment.name] as mongoose.Model<Payment>) || mongoose.model<Payment>(Payment.name, PaymentSchema);
  private readonly FeeModel = (mongoose.models[Fee.name] as mongoose.Model<Fee>) || mongoose.model<Fee>(Fee.name, FeeSchema);
  private readonly PricingModel = (mongoose.models[Pricing.name] as mongoose.Model<Pricing>) || mongoose.model<Pricing>(Pricing.name, PricingSchema);
  private readonly KycsModel = (mongoose.models[Kycs.name] as mongoose.Model<Kycs>) || mongoose.model<Kycs>(Kycs.name, KycsSchema);
  private readonly InspectionModel =
    (mongoose.models[Inspection.name] as mongoose.Model<Inspection>) || mongoose.model<Inspection>(Inspection.name, InspectionSchema);
  private readonly ReportModel = (mongoose.models[Report.name] as mongoose.Model<Report>) || mongoose.model<Report>(Report.name, ReportSchema);
  private readonly ReportsPhotoModel =
    (mongoose.models[ReportsPhoto.name] as mongoose.Model<ReportsPhoto>) || mongoose.model<ReportsPhoto>(ReportsPhoto.name, ReportsPhotoSchema);
  private readonly ContractModel =
    (mongoose.models[Contract.name] as mongoose.Model<Contract>) || mongoose.model<Contract>(Contract.name, ContractSchema);

  constructor(seed?: number) {
    const envSeed = Number.isNaN(Number(process.env.MOCK_DATA_SEED)) ? undefined : Number(process.env.MOCK_DATA_SEED);
    const resolvedSeed = seed ?? envSeed ?? 12345;
    faker.seed(resolvedSeed);
  }

  async connect(): Promise<void> {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI is not set");
    }

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");
  }

  async disconnect(): Promise<void> {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }

  async clearDatabase(): Promise<void> {
    const collections = mongoose.connection.collections;
    for (const collection of Object.values(collections)) {
      await collection.deleteMany({});
    }
    console.log("Database cleared");
  }

  async generateAllData(options?: { clearExisting?: boolean }): Promise<void> {
    console.log("Starting mock data generation...");

    if (options?.clearExisting) {
      await this.clearDatabase();
    }
    await this.generateUsers();
    await this.generateAdmins();
    await this.generateRenters();

    await this.generateStations();
    await this.generateStaff();
    await this.generateVehicles();
    await this.generatePricings();

    await this.generateBookings();
    await this.generateRentals();
    await this.generatePayments();
    await this.generateFees();
    // await this.generateKycs();
    // await this.generateInspections();
    // await this.generateReports();
    // await this.generateReportsPhotos();
    // await this.generateContracts();

    console.log("Mock data generation completed!");
  }

  private async generateUsers(): Promise<void> {
    console.log("Loading users...");
    const existingUsers = await this.UserModel.find({}, { _id: 1, role: 1 }).lean().exec();

    if (existingUsers.length) {
      for (const user of existingUsers) {
        const id = user._id;
        const role = user.role ?? Role.UNKNOWN;
        this.ids.users.push(id);
        this.userRoleMap.set(String(id), role);
      }
      console.log(`Loaded ${existingUsers.length} users`);
      return;
    }

    console.warn("No existing users found; generating baseline mock users...");
    const roleDistribution: Array<{ role: Role; count: number }> = [
      { role: Role.ADMIN, count: 2 },
      { role: Role.STAFF, count: 6 },
      { role: Role.RENTER, count: 10 },
      { role: Role.UNKNOWN, count: 2 },
    ];

    for (const { role, count } of roleDistribution) {
      for (let i = 0; i < count; i++) {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const userDoc = new this.UserModel({
          email: faker.internet.email({ firstName, lastName, provider: "example.com" }).toLowerCase(),
          password: this.hashPassword("password123"),
          full_name: `${firstName} ${lastName}`,
          role,
          is_active: this.bool(0.9),
          phone: this.bool(0.65) ? `+84${faker.string.numeric({ length: 9 })}` : undefined,
        } as Partial<User>);

        const saved = await userDoc.save();
        this.ids.users.push(saved._id);
        this.userRoleMap.set(String(saved._id), role);
      }
    }

    console.log(`Generated ${this.ids.users.length} users`);
  }

  private async generateStations(): Promise<void> {
    console.log("Generating stations...");
    const cities = [
      "Hanoi",
      "Ho Chi Minh City",
      "Da Nang",
      "Hai Phong",
      "Can Tho",
      "Bien Hoa",
      "Nha Trang",
      "Hue",
      "Vung Tau",
      "Ha Long",
      "Buon Ma Thuot",
      "Da Lat",
    ];

    for (let i = 0; i < 10; i++) {
      const city = faker.helpers.arrayElement(cities);
      const stationDoc = new this.StationModel({
        name: `${city} EV Hub ${i + 1}`,
        address: faker.location.streetAddress(),
        latitude: faker.location.latitude({ min: 8, max: 23.5 }),
        longitude: faker.location.longitude({ min: 102, max: 110 }),
        is_active: this.bool(0.95),
      } as Partial<Station>);

      const saved = await stationDoc.save();
      this.ids.stations.push(saved._id);
    }

    console.log(`Generated ${this.ids.stations.length} stations`);
  }

  private async generateVehicles(): Promise<void> {
    console.log("Generating vehicles...");
    const makes = ["Tesla", "VinFast", "Nissan", "BMW", "Audi", "Hyundai", "Kia", "Toyota", "BYD", "Mercedes-Benz"];
    const models = ["Model 3", "VF8", "Leaf", "i3", "e-tron", "Ioniq 5", "EV6", "bZ4X", "Han", "EQB"];

    for (let i = 0; i < 40; i++) {
      const make = faker.helpers.arrayElement(makes);
      const model = faker.helpers.arrayElement(models);
      const batteryCapacity = faker.number.int({ min: 45, max: 110 });
      const currentBattery = faker.number.int({ min: 10, max: batteryCapacity });
      const currentMileage = faker.number.int({ min: 0, max: 60000 });

      const vehicleDoc = new this.VehicleModel({
        station_id: this.bool(0.9) ? faker.helpers.arrayElement(this.ids.stations) : undefined,
        make,
        model,
        model_year: faker.number.int({ min: 2018, max: 2025 }),
        category: "EV",
        battery_capacity_kwh: batteryCapacity,
        range_km: faker.number.int({ min: 220, max: 520 }),
        vin_number: this.bool(0.85) ? `VN${faker.string.alphanumeric({ length: 15, casing: "upper" })}` : undefined,
        img_url: this.bool(0.55) ? faker.image.url() : undefined,
        is_active: this.bool(0.95),
        current_battery_capacity_kwh: currentBattery,
        current_mileage: currentMileage,
        status: faker.helpers.arrayElement(Object.values(VehicleStatus)),
      } as Partial<Vehicle>);

      const saved = await vehicleDoc.save();
      this.ids.vehicles.push(saved._id);
      this.vehicleMetrics.set(String(saved._id), {
        battery: currentBattery,
        mileage: currentMileage,
      });
    }

    console.log(`Generated ${this.ids.vehicles.length} vehicles`);
  }

  private async generateAdmins(): Promise<void> {
    console.log("Loading admins...");
    const existingAdmins = await this.AdminModel.find({}, { _id: 1, user_id: 1 }).lean().exec();

    if (existingAdmins.length) {
      for (const admin of existingAdmins) {
        this.ids.admins.push(admin._id);
        if (admin.user_id) {
          this.userRoleMap.set(String(admin.user_id), Role.ADMIN);
        }
      }
      console.log(`Loaded ${existingAdmins.length} admins`);
      return;
    }

    const adminUserIds = this.ids.users.filter((id) => this.userRoleMap.get(String(id)) === Role.ADMIN);
    if (!adminUserIds.length) {
      console.warn("No admin users found; skipping admin document generation.");
      return;
    }

    console.warn("No existing admins found; generating mock admin documents...");
    let generated = 0;
    for (const userId of adminUserIds) {
      const adminDoc = new this.AdminModel({
        user_id: userId,
        title: faker.helpers.arrayElement(["IT Admin", "Operations Admin", "Finance Admin", "People Admin"]),
        notes: this.bool(0.35) ? faker.lorem.sentence() : undefined,
        hire_date: faker.date.past({ years: 5 }),
      } as Partial<Admin>);

      const saved = await adminDoc.save();
      this.ids.admins.push(saved._id);
      this.userRoleMap.set(String(userId), Role.ADMIN);
      generated += 1;
    }

    console.log(`Generated ${generated} admins`);
  }

  private async generateStaff(): Promise<void> {
    console.log("Loading staff...");
    const existingStaff = await this.StaffModel.find({}, { _id: 1, user_id: 1 }).lean().exec();

    if (existingStaff.length) {
      for (const staff of existingStaff) {
        this.ids.staff.push(staff._id);
        if (staff.user_id) {
          this.userRoleMap.set(String(staff.user_id), Role.STAFF);
        }
      }
      console.log(`Loaded ${existingStaff.length} staff`);
      return;
    }

    const staffUserIds = this.ids.users.filter((id) => this.userRoleMap.get(String(id)) === Role.STAFF);
    if (!staffUserIds.length) {
      console.warn("No staff users found; skipping staff document generation.");
      return;
    }

    console.warn("No existing staff found; generating mock staff documents...");
    let index = 0;
    let generated = 0;
    for (const userId of staffUserIds) {
      const stationId = this.ids.stations.length ? faker.helpers.arrayElement(this.ids.stations) : undefined;
      const staffDoc = new this.StaffModel({
        user_id: userId,
        station_id: stationId,
        employee_code: `EMP${String(++index).padStart(5, "0")}`,
        position: faker.helpers.arrayElement(["Station Manager", "Technician", "Customer Success", "Ops Specialist"]),
        hire_date: faker.date.past({ years: 4 }),
      } as Partial<Staff>);

      const saved = await staffDoc.save();
      this.ids.staff.push(saved._id);
      this.userRoleMap.set(String(userId), Role.STAFF);
      generated += 1;
    }

    console.log(`Generated ${generated} staff`);
  }

  private async generateRenters(): Promise<void> {
    console.log("Loading renters...");
    const existingRenters = await this.RenterModel.find({}, { _id: 1, user_id: 1 }).lean().exec();

    if (existingRenters.length) {
      for (const renter of existingRenters) {
        this.ids.renters.push(renter._id);
        if (renter.user_id) {
          this.userRoleMap.set(String(renter.user_id), Role.RENTER);
        }
      }
      console.log(`Loaded ${existingRenters.length} renters`);
      return;
    }

    const renterUserIds = this.ids.users.filter((id) => this.userRoleMap.get(String(id)) === Role.RENTER);
    if (!renterUserIds.length) {
      console.warn("No renter users found; skipping renter document generation.");
      return;
    }

    console.warn("No existing renters found; generating mock renter documents...");
    let generated = 0;
    for (const userId of renterUserIds) {
      const renterDoc = new this.RenterModel({
        user_id: userId,
        address: faker.location.streetAddress(),
        date_of_birth: faker.date.birthdate({ min: 21, max: 65, mode: "age" }),
        risk_score: faker.number.int({ min: 0, max: 100 }),
      } as Partial<Renter>);

      const saved = await renterDoc.save();
      this.ids.renters.push(saved._id);
      this.userRoleMap.set(String(userId), Role.RENTER);
      generated += 1;
    }

    console.log(`Generated ${generated} renters`);
  }

  private async generateBookings(): Promise<void> {
    console.log("Generating bookings...");
    if (!this.ids.renters.length || !this.ids.vehicles.length) {
      console.warn("Skipping bookings because renters or vehicles are missing");
      return;
    }

    for (let i = 0; i < 50; i++) {
      const renterId = faker.helpers.arrayElement(this.ids.renters);
      const vehicleId = faker.helpers.arrayElement(this.ids.vehicles);
      const start = faker.date.recent({ days: 120 });
      const expectedReturn = faker.date.soon({ days: faker.number.int({ min: 1, max: 10 }), refDate: start });
      const verificationStatus = faker.helpers.arrayElement(Object.values(BookingVerificationStatus));
      let status: BookingStatus = BookingStatus.PENDING_VERIFICATION;

      if (verificationStatus === BookingVerificationStatus.APPROVED) {
        status = BookingStatus.VERIFIED;
      } else if (verificationStatus === BookingVerificationStatus.PENDING) {
        status = this.bool(0.3) ? BookingStatus.CANCELLED : BookingStatus.PENDING_VERIFICATION;
      } else {
        status = BookingStatus.CANCELLED;
      }

      const depositFee = this.money(300_000, 2_000_000);
      const rentalFee = this.money(200_000, 1_500_000);
      const miscFee = this.money(0, 120_000);
      const totalFee = depositFee + rentalFee + miscFee;

      const verifiedBy = verificationStatus === BookingVerificationStatus.PENDING ? undefined : this.randomStaffId();
      const verifiedAt = verifiedBy ? faker.date.between({ from: start, to: expectedReturn }) : undefined;

      const bookingDoc = new this.BookingModel({
        renter_id: renterId,
        vehicle_id: vehicleId,
        rental_start_datetime: start,
        expected_return_datetime: expectedReturn,
        status,
        verification_status: verificationStatus,
        verified_by_staff_id: verifiedBy,
        verified_at: verifiedAt,
        cancel_reason: status === BookingStatus.CANCELLED ? faker.lorem.sentence() : undefined,
        total_booking_fee_amount: totalFee,
        deposit_fee_amount: depositFee,
        rental_fee_amount: rentalFee,
      } as Partial<Booking>);

      const saved = await bookingDoc.save();
      this.ids.bookings.push(saved._id);
      this.bookingMeta.set(String(saved._id), {
        renterId,
        vehicleId,
        start,
        expectedReturn,
        status,
        verificationStatus,
        totalFee,
        depositFee,
        rentalFee,
      });
    }

    console.log(`Generated ${this.ids.bookings.length} bookings`);
  }

  private async generateRentals(): Promise<void> {
    console.log("Generating rentals...");
    const approvedBookings = this.ids.bookings.filter((id) => {
      const meta = this.bookingMeta.get(String(id));
      return meta?.verificationStatus === BookingVerificationStatus.APPROVED && meta.status === BookingStatus.VERIFIED;
    });

    if (!approvedBookings.length) {
      console.warn("No approved bookings available for rentals");
      return;
    }

    const rentalTargets = faker.helpers.shuffle(approvedBookings).slice(0, Math.floor(approvedBookings.length * 0.75));

    for (const bookingId of rentalTargets) {
      const meta = this.bookingMeta.get(String(bookingId));
      if (!meta) continue;

      const status = faker.helpers.arrayElement(Object.values(RentalStatus));
      const pickup = meta.start;
      const expectedReturn = meta.expectedReturn;

      let actualReturn: Date | undefined;
      if (status === RentalStatus.COMPLETED) {
        actualReturn = faker.date.between({ from: pickup, to: faker.date.soon({ days: 2, refDate: expectedReturn }) });
      } else if (status === RentalStatus.LATE) {
        actualReturn = faker.date.soon({ days: 3, refDate: expectedReturn });
      } else if (status === RentalStatus.IN_PROGRESS) {
        actualReturn = undefined;
      } else if (status === RentalStatus.CANCELLED) {
        actualReturn = undefined;
      }

      const rentalDoc = new this.RentalModel({
        booking_id: bookingId,
        vehicle_id: meta.vehicleId,
        pickup_datetime: pickup,
        expected_return_datetime: expectedReturn,
        actual_return_datetime: actualReturn,
        status,
        score: status === RentalStatus.COMPLETED ? faker.number.int({ min: 3, max: 5 }) : null,
        comment: this.bool(0.25) ? faker.lorem.sentences(faker.number.int({ min: 1, max: 2 })) : undefined,
        rated_at: status === RentalStatus.COMPLETED ? faker.date.soon({ days: 3, refDate: actualReturn ?? expectedReturn }) : undefined,
      } as Partial<Rental>);

      const saved = await rentalDoc.save();
      this.ids.rentals.push(saved._id);
      this.rentalMeta.set(String(saved._id), {
        bookingId,
        vehicleId: meta.vehicleId,
        pickup,
        expectedReturn,
        actualReturn,
        status,
      });
    }

    console.log(`Generated ${this.ids.rentals.length} rentals`);
  }

  private async generatePayments(): Promise<void> {
    console.log("Generating payments...");

    for (const bookingId of this.ids.bookings) {
      const meta = this.bookingMeta.get(String(bookingId));
      if (!meta) continue;

      const hasRental = Array.from(this.rentalMeta.values()).some((r) => String(r.bookingId) === String(bookingId));
      let status: PaymentStatus;
      if (meta.status === BookingStatus.CANCELLED) {
        status = faker.helpers.arrayElement([PaymentStatus.REFUNDED, PaymentStatus.FAILED, PaymentStatus.PENDING]);
      } else if (hasRental) {
        status = faker.helpers.arrayElement([PaymentStatus.PAID, PaymentStatus.PAID, PaymentStatus.PENDING]);
      } else {
        status = faker.helpers.arrayElement(Object.values(PaymentStatus));
      }

      const unpaidMax = Math.max(0, meta.totalFee);
      const unpaidMin = Math.min(100_000, unpaidMax);
      const amountPaid = status === PaymentStatus.PAID ? meta.totalFee : this.money(unpaidMin, unpaidMax);

      const paymentDoc = new this.PaymentModel({
        booking_id: bookingId,
        method: faker.helpers.arrayElement(Object.values(PaymentMethod)),
        status,
        amount_paid: amountPaid,
        transaction_code: this.bool(0.8) ? faker.string.alphanumeric({ length: 14, casing: "upper" }) : undefined,
      } as Partial<Payment>);

      const saved = await paymentDoc.save();
      this.ids.payments.push(saved._id);
    }

    console.log(`Generated ${this.ids.payments.length} payments`);
  }

  private async generateFees(): Promise<void> {
    console.log("Generating fees...");

    for (const bookingId of this.ids.bookings) {
      const meta = this.bookingMeta.get(String(bookingId));
      if (!meta) continue;

      const feeSpecs = [
        { type: FeeType.DEPOSIT_FEE, amount: meta.depositFee },
        { type: FeeType.RENTAL_FEE, amount: meta.rentalFee },
      ];

      if (this.bool(0.2)) {
        feeSpecs.push({ type: FeeType.OTHER, amount: this.money(20_000, 150_000) });
      }

      for (const spec of feeSpecs) {
        if (spec.amount <= 0) continue;
        const feeDoc = new this.FeeModel({
          booking_id: bookingId,
          type: spec.type,
          amount: spec.amount,
          description: `${spec.type.replace(/_/g, " ").toUpperCase()} charge`,
          currency: "VND",
        } as Partial<Fee>);

        const saved = await feeDoc.save();
        this.ids.fees.push(saved._id);
      }
    }

    console.log(`Generated ${this.ids.fees.length} fees`);
  }

  private async generatePricings(): Promise<void> {
    console.log("Generating pricings...");
    const sampleVehicles = faker.helpers.shuffle(this.ids.vehicles).slice(0, 30);

    for (const vehicleId of sampleVehicles) {
      const effectiveFrom = faker.date.past({ years: 1 });
      const effectiveTo = this.bool(0.3) ? faker.date.soon({ days: faker.number.int({ min: 30, max: 180 }), refDate: effectiveFrom }) : undefined;

      const pricingDoc = new this.PricingModel({
        vehicle_id: vehicleId,
        price_per_hour: this.money(45_000, 210_000),
        price_per_day: this.bool(0.65) ? this.money(350_000, 1_200_000) : undefined,
        effective_from: effectiveFrom,
        effective_to: effectiveTo,
        deposit_amount: this.money(500_000, 3_000_000),
        late_return_fee_per_hour: this.bool(0.7) ? this.money(10_000, 60_000) : undefined,
        mileage_limit_per_day: this.bool(0.5) ? faker.number.int({ min: 80, max: 400 }) : undefined,
        excess_mileage_fee: this.bool(0.5) ? this.money(1_000, 12_000) : undefined,
      } as Partial<Pricing>);

      const saved = await pricingDoc.save();
      this.ids.pricings.push(saved._id);
    }

    console.log(`Generated ${this.ids.pricings.length} pricings`);
  }

  private async generateKycs(): Promise<void> {
    console.log("Generating KYC records...");
    const kycCount = Math.min(50, this.ids.renters.length);

    for (let i = 0; i < kycCount; i++) {
      const renterId = this.ids.renters[i];
      const submittedAt = faker.date.recent({ days: 90 });
      const kycDoc = new this.KycsModel({
        renter_id: renterId,
        type: faker.helpers.arrayElement(Object.values(KycType)),
        document_number: `VN${faker.string.numeric({ length: 10 })}`,
        expiry_date: faker.date.soon({ days: faker.number.int({ min: 365, max: 365 * 5 }), refDate: submittedAt }),
        status: faker.helpers.arrayElement(Object.values(KycStatus)),
        submitted_at: submittedAt,
        verified_at: this.bool(0.7) ? faker.date.soon({ days: 20, refDate: submittedAt }) : undefined,
      } as Partial<Kycs>);

      const saved = await kycDoc.save();
      this.ids.kycs.push(saved._id);
    }

    console.log(`Generated ${this.ids.kycs.length} KYC records`);
  }

  private async generateInspections(): Promise<void> {
    console.log("Generating inspections...");
    if (!this.ids.rentals.length) {
      console.warn("No rentals found; skipping inspections");
      return;
    }

    for (const rentalId of this.ids.rentals) {
      const meta = this.rentalMeta.get(String(rentalId));
      if (!meta) continue;
      const vehicleMetrics = this.vehicleMetrics.get(String(meta.vehicleId)) ?? { battery: 80, mileage: 10_000 };

      const preInspection = new this.InspectionModel({
        rental_id: rentalId,
        type: InspectionType.PRE_RENTAL,
        inspected_at: new Date(meta.pickup.getTime() - faker.number.int({ min: 15, max: 90 }) * 60_000),
        inspector_staff_id: this.randomStaffId(),
        current_battery_capacity_kwh: vehicleMetrics.battery,
        current_mileage: vehicleMetrics.mileage,
      } as Partial<Inspection>);

      const preSaved = await preInspection.save();
      this.ids.inspections.push(preSaved._id);
      this.inspectionMeta.set(String(preSaved._id), {
        rentalId,
        inspectedAt: preSaved.inspected_at,
        type: InspectionType.PRE_RENTAL,
      });

      if (!meta.actualReturn) {
        continue;
      }

      const mileageDelta = faker.number.int({ min: 30, max: 420 });
      vehicleMetrics.mileage += mileageDelta;
      const batteryAfter = Math.max(0, vehicleMetrics.battery - faker.number.int({ min: 5, max: 30 }));
      vehicleMetrics.battery = batteryAfter;
      this.vehicleMetrics.set(String(meta.vehicleId), vehicleMetrics);

      const postInspection = new this.InspectionModel({
        rental_id: rentalId,
        type: InspectionType.POST_RENTAL,
        inspected_at: new Date(meta.actualReturn.getTime() + faker.number.int({ min: 5, max: 60 }) * 60_000),
        inspector_staff_id: this.randomStaffId(),
        current_battery_capacity_kwh: vehicleMetrics.battery,
        current_mileage: vehicleMetrics.mileage,
      } as Partial<Inspection>);

      const postSaved = await postInspection.save();
      this.ids.inspections.push(postSaved._id);
      this.inspectionMeta.set(String(postSaved._id), {
        rentalId,
        inspectedAt: postSaved.inspected_at,
        type: InspectionType.POST_RENTAL,
      });
    }

    console.log(`Generated ${this.ids.inspections.length} inspections`);
  }

  private async generateReports(): Promise<void> {
    console.log("Generating reports...");

    for (const inspectionId of this.ids.inspections) {
      const meta = this.inspectionMeta.get(String(inspectionId));
      if (!meta || meta.type !== InspectionType.POST_RENTAL) continue;

      if (!this.bool(0.55)) continue;

      const bookingMeta = (() => {
        const rental = this.rentalMeta.get(String(meta.rentalId));
        return rental ? this.bookingMeta.get(String(rental.bookingId)) : undefined;
      })();

      const damageFound = this.bool(0.35);
      const damagePrice = damageFound ? this.money(100_000, 5_000_000) : 0;
      const deposit = bookingMeta?.depositFee ?? 0;
      const isOverDeposit = damageFound && damagePrice > deposit && this.bool(0.6);
      const overDeposit = isOverDeposit ? Math.max(50_000, damagePrice - deposit) : 0;

      const reportDoc = new this.ReportModel({
        inspection_id: inspectionId,
        damage_notes: damageFound ? faker.lorem.sentences(faker.number.int({ min: 1, max: 2 })) : undefined,
        damage_found: damageFound,
        damage_price: damagePrice,
        is_over_deposit: isOverDeposit,
        over_deposit_fee_amount: overDeposit,
      } as Partial<Report>);

      const saved = await reportDoc.save();
      this.ids.reports.push(saved._id);
      this.reportByInspection.set(String(inspectionId), saved._id);
    }

    console.log(`Generated ${this.ids.reports.length} reports`);
  }

  private async generateReportsPhotos(): Promise<void> {
    console.log("Generating report photos...");

    for (const inspectionId of this.ids.inspections) {
      const photoCount = faker.number.int({ min: 0, max: 4 });
      if (photoCount === 0) continue;

      const reportId = this.reportByInspection.get(String(inspectionId));
      for (let i = 0; i < photoCount; i++) {
        const photoDoc = new this.ReportsPhotoModel({
          inspection_id: inspectionId,
          report_id: reportId,
          url: faker.image.url(),
          label: this.bool(0.5) ? faker.lorem.words(faker.number.int({ min: 2, max: 4 })) : undefined,
        } as Partial<ReportsPhoto>);

        const saved = await photoDoc.save();
        this.ids.reportsPhotos.push(saved._id);
      }
    }

    console.log(`Generated ${this.ids.reportsPhotos.length} report photos`);
  }

  private async generateContracts(): Promise<void> {
    console.log("Generating contracts...");

    for (const rentalId of this.ids.rentals) {
      const meta = this.rentalMeta.get(String(rentalId));
      if (!meta) continue;

      if (![RentalStatus.COMPLETED, RentalStatus.LATE].includes(meta.status)) continue;

      const contractDoc = new this.ContractModel({
        rental_id: rentalId,
        completed_at: meta.actualReturn ?? faker.date.recent({ days: 45 }),
        document_url: faker.internet.url(),
      } as Partial<Contract>);

      const saved = await contractDoc.save();
      this.ids.contracts.push(saved._id);
    }

    console.log(`Generated ${this.ids.contracts.length} contracts`);
  }

  private randomStaffId(): mongoose.Types.ObjectId | undefined {
    if (!this.ids.staff.length) {
      return undefined;
    }
    return faker.helpers.arrayElement(this.ids.staff);
  }

  private hashPassword(password: string): string {
    return password;
  }

  private money(min: number, max: number, step = 1000): number {
    if (max < min) {
      [min, max] = [max, min];
    }

    const scaledMin = Math.ceil(min / step);
    const scaledMax = Math.floor(max / step);

    if (scaledMax < scaledMin) {
      return scaledMin * step;
    }

    return faker.number.int({ min: scaledMin, max: scaledMax }) * step;
  }

  private bool(probability: number): boolean {
    return faker.number.float({ min: 0, max: 1 }) < probability;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const seedArg = args.find((arg) => arg.startsWith("--seed="));
  const drop = args.includes("--drop");
  const seed = seedArg ? Number(seedArg.split("=")[1]) : undefined;

  if (seedArg && Number.isNaN(seed)) {
    throw new Error(`Invalid seed provided: ${seedArg}`);
  }

  const generator = new MockDataGenerator(seed);

  try {
    await generator.connect();
    await generator.generateAllData({ clearExisting: drop });
    console.log("All mock data generated successfully!");
  } catch (error) {
    console.error("Error generating mock data:", error);
    process.exit(1);
  } finally {
    await generator.disconnect();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error("Error running mock data generator:", error);
    process.exit(1);
  });
}

export { MockDataGenerator };
