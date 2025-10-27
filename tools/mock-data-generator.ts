import { faker } from "@faker-js/faker";
import mongoose from "mongoose";

import * as dotenv from "dotenv";
dotenv.config();
import "tsconfig-paths/register";
import { Role } from "../src/common/enums/role.enum";
import { BookingStatus, BookingVerificationStatus } from "../src/common/enums/booking.enum";
import { PaymentMethod, PaymentStatus } from "../src/common/enums/payment.enum";
import { RentalStatus } from "../src/common/enums/rental.enum";
import { StatusVehicleAtStation } from "../src/common/enums/vehicle_at_station.enum";
import { FeeType } from "../src/common/enums/fee.enum";
import { InspectionType } from "../src/common/enums/inspection.enum";
import { KycStatus, KycType } from "../src/common/enums/kyc.enum";
import { StaffTransferStatus } from "../src/common/enums/staff_transfer.enum";
import { VehicleTransferStatus } from "../src/common/enums/vehicle_transfer.enum";

import { User, UserSchema } from "../src/models/user.schema";
import { Admin, AdminSchema } from "../src/models/admin.schema";
import { Staff, StaffSchema } from "../src/models/staff.schema";
import { Renter, RenterSchema } from "../src/models/renter.schema";
import { Vehicle, VehicleSchema } from "../src/models/vehicle.schema";
import { Station, StationSchema } from "../src/models/station.schema";
import { VehicleAtStation, VehicleAtStationSchema } from "../src/models/vehicle_at_station.schema";
import { Booking, BookingSchema } from "../src/models/booking.schema";
import { Rental, RentalSchema } from "../src/models/rental.schema";
import { Payment, PaymentSchema } from "../src/models/payment.schema";
import { Fee, FeeSchema } from "../src/models/fee.schema";
import { Pricing, PricingSchema } from "../src/models/pricings.schema";
import { Kycs, KycsSchema } from "../src/models/kycs.schema";
import { Inspection, InspectionSchema } from "../src/models/inspections.schema";
import { Report, ReportSchema } from "../src/models/report.schema";
import { ReportsPhoto, ReportsPhotoSchema } from "../src/models/reports_photo.schema";
import { StaffAtStation, StaffAtStationSchema } from "../src/models/staff_at_station.schema";
import { StaffTransfer, StaffTransferSchema } from "../src/models/staff_transfer.schema";
import { Contract, ContractSchema } from "../src/models/contract.schema";
import { VehicleTransfer, VehicleTransferSchema } from "../src/models/vehicle_transfer.schema";

interface MockDataIds {
  users: mongoose.Types.ObjectId[];
  admins: mongoose.Types.ObjectId[];
  staff: mongoose.Types.ObjectId[];
  renters: mongoose.Types.ObjectId[];
  vehicles: mongoose.Types.ObjectId[];
  stations: mongoose.Types.ObjectId[];
  vehicleAtStations: mongoose.Types.ObjectId[];
  bookings: mongoose.Types.ObjectId[];
  rentals: mongoose.Types.ObjectId[];
  payments: mongoose.Types.ObjectId[];
}

class MockDataGenerator {
  private ids: MockDataIds = {
    users: [],
    admins: [],
    staff: [],
    renters: [],
    vehicles: [],
    stations: [],
    vehicleAtStations: [],
    bookings: [],
    rentals: [],
    payments: [],
  };

  private userRoleMap = new Map<string, Role>();

  // Models from project schemas
  private UserModel = (mongoose.models[User.name] as mongoose.Model<User>) || mongoose.model<User>(User.name, UserSchema);
  private AdminModel = (mongoose.models[Admin.name] as mongoose.Model<Admin>) || mongoose.model<Admin>(Admin.name, AdminSchema);
  private StaffModel = (mongoose.models[Staff.name] as mongoose.Model<Staff>) || mongoose.model<Staff>(Staff.name, StaffSchema);
  private RenterModel = (mongoose.models[Renter.name] as mongoose.Model<Renter>) || mongoose.model<Renter>(Renter.name, RenterSchema);
  private VehicleModel = (mongoose.models[Vehicle.name] as mongoose.Model<Vehicle>) || mongoose.model<Vehicle>(Vehicle.name, VehicleSchema);
  private StationModel = (mongoose.models[Station.name] as mongoose.Model<Station>) || mongoose.model<Station>(Station.name, StationSchema);
  private VehicleAtStationModel =
    (mongoose.models[VehicleAtStation.name] as mongoose.Model<VehicleAtStation>) ||
    mongoose.model<VehicleAtStation>(VehicleAtStation.name, VehicleAtStationSchema);
  private BookingModel = (mongoose.models[Booking.name] as mongoose.Model<Booking>) || mongoose.model<Booking>(Booking.name, BookingSchema);
  private RentalModel = (mongoose.models[Rental.name] as mongoose.Model<Rental>) || mongoose.model<Rental>(Rental.name, RentalSchema);
  private PaymentModel = (mongoose.models[Payment.name] as mongoose.Model<Payment>) || mongoose.model<Payment>(Payment.name, PaymentSchema);
  private FeeModel = (mongoose.models[Fee.name] as mongoose.Model<Fee>) || mongoose.model<Fee>(Fee.name, FeeSchema);
  private PricingModel = (mongoose.models[Pricing.name] as mongoose.Model<Pricing>) || mongoose.model<Pricing>(Pricing.name, PricingSchema);
  private KycsModel = (mongoose.models[Kycs.name] as mongoose.Model<Kycs>) || mongoose.model<Kycs>(Kycs.name, KycsSchema);
  private InspectionModel =
    (mongoose.models[Inspection.name] as mongoose.Model<Inspection>) || mongoose.model<Inspection>(Inspection.name, InspectionSchema);
  private ReportModel = (mongoose.models[Report.name] as mongoose.Model<Report>) || mongoose.model<Report>(Report.name, ReportSchema);
  private ReportsPhotoModel =
    (mongoose.models[ReportsPhoto.name] as mongoose.Model<ReportsPhoto>) || mongoose.model<ReportsPhoto>(ReportsPhoto.name, ReportsPhotoSchema);
  private StaffAtStationModel =
    (mongoose.models[StaffAtStation.name] as mongoose.Model<StaffAtStation>) ||
    mongoose.model<StaffAtStation>(StaffAtStation.name, StaffAtStationSchema);
  private StaffTransferModel =
    (mongoose.models[StaffTransfer.name] as mongoose.Model<StaffTransfer>) || mongoose.model<StaffTransfer>(StaffTransfer.name, StaffTransferSchema);
  private ContractModel = (mongoose.models[Contract.name] as mongoose.Model<Contract>) || mongoose.model<Contract>(Contract.name, ContractSchema);
  private VehicleTransferModel =
    (mongoose.models[VehicleTransfer.name] as mongoose.Model<VehicleTransfer>) ||
    mongoose.model<VehicleTransfer>(VehicleTransfer.name, VehicleTransferSchema);

  constructor() {
    faker.seed(12345); // For consistent results
  }

  async connect(): Promise<void> {
    try {
      const mongoUri = process.env.MONGO_URI as string;
      if (!mongoUri) {
        throw new Error("MONGO_URI is not set");
      }
      await mongoose.connect(mongoUri);
      console.log("Connected to MongoDB");
    } catch (error) {
      console.error("MongoDB connection error:", error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }

  async clearDatabase(): Promise<void> {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
    console.log("Database cleared");
  }

  async generateAllData(): Promise<void> {
    console.log("Starting mock data generation...");

    // Generate base data first (no dependencies)
    await this.generateUsers();
    await this.generateStations();
    await this.generateVehicles();

    // Generate data with dependencies
    await this.generateAdmins();
    await this.generateStaff();
    await this.generateRenters();
    await this.generateVehicleAtStations();
    await this.generateBookings();
    await this.generateRentals();
    await this.generatePayments();
    await this.generateFees();
    await this.generatePricings();
    await this.generateKycs();
    await this.generateInspections();
    await this.generateReports();
    await this.generateReportsPhotos();
    await this.generateStaffAtStations();
    await this.generateStaffTransfers();
    await this.generateContracts();
    await this.generateVehicleTransfers();

    console.log("Mock data generation completed!");
  }

  private async generateUsers(): Promise<void> {
    console.log("Generating users...");
    const users = [];

    // Target distribution for roles to align with auth flows
    const adminCount = 5;
    const staffCount = 20;
    const renterCount = 30;
    const unknownCount = 5;
    const userSpecs: Array<{ role: Role; count: number }> = [
      { role: Role.ADMIN, count: adminCount },
      { role: Role.STAFF, count: staffCount },
      { role: Role.RENTER, count: renterCount },
      { role: Role.UNKNOWN, count: unknownCount },
    ];

    for (const spec of userSpecs) {
      for (let i = 0; i < spec.count; i++) {
        const user = new this.UserModel({
          email: faker.internet.email().toLowerCase(),
          password: this.hashPassword("password123"),
          full_name: faker.person.fullName(),
          role: spec.role,
          is_active: this.bool(0.9),
          phone: faker.helpers.maybe(() => faker.phone.number(), { probability: 0.7 }),
        } as Partial<User>);

        const savedUser = await user.save();
        this.ids.users.push(savedUser._id);
        this.userRoleMap.set(String(savedUser._id), spec.role);
        users.push(savedUser);
      }
    }

    console.log(`Generated ${users.length} users`);
  }

  private async generateStations(): Promise<void> {
    console.log("Generating stations...");
    const stations = [];
    const stationCount = 20;

    const vietnamCities = ["Hanoi", "Ho Chi Minh City", "Da Nang", "Hai Phong", "Can Tho", "Bien Hoa", "Nha Trang", "Hue", "Vung Tau", "Ha Long"];

    for (let i = 0; i < stationCount; i++) {
      const city = faker.helpers.arrayElement(vietnamCities);
      const station = new this.StationModel({
        name: `${city} EV Station ${i + 1}`,
        address: faker.location.streetAddress(),
        latitude: faker.location.latitude({ min: 8, max: 24 }), // Vietnam latitude range
        longitude: faker.location.longitude({ min: 102, max: 110 }), // Vietnam longitude range
        is_active: this.bool(0.95), // 95% active
      });

      const savedStation = await station.save();
      this.ids.stations.push(savedStation._id);
      stations.push(savedStation);
    }

    console.log(`Generated ${stations.length} stations`);
  }

  private async generateVehicles(): Promise<void> {
    console.log("Generating vehicles...");
    const vehicles = [];
    const vehicleCount = 50;

    const vehicleMakes = ["Tesla", "Nissan", "BMW", "Audi", "Hyundai", "Kia", "VinFast", "Toyota"];
    const vehicleModels = ["Model 3", "Leaf", "i3", "e-tron", "Ioniq 5", "EV6", "VF8", "bZ4X"];

    for (let i = 0; i < vehicleCount; i++) {
      const make = faker.helpers.arrayElement(vehicleMakes);
      const model = faker.helpers.arrayElement(vehicleModels);

      const vehicle = new this.VehicleModel({
        make,
        model,
        model_year: faker.date.past({ years: 5 }).getFullYear(),
        category: "EV",
        battery_capacity_kwh: faker.number.int({ min: 40, max: 100 }),
        range_km: faker.number.int({ min: 200, max: 500 }),
        vin_number: faker.helpers.maybe(() => faker.vehicle.vin(), { probability: 0.8 }),
        img_url: faker.helpers.maybe(() => faker.image.url(), { probability: 0.6 }),
        is_active: faker.datatype.boolean(0.9),
      });

      const savedVehicle = await vehicle.save();
      this.ids.vehicles.push(savedVehicle._id);
      vehicles.push(savedVehicle);
    }

    console.log(`Generated ${vehicles.length} vehicles`);
  }

  private async generateAdmins(): Promise<void> {
    console.log("Generating admins...");
    const admins = [];
    // Create Admin docs only for users with role ADMIN
    const adminUserIds = this.ids.users.filter((id) => this.userRoleMap.get(String(id)) === Role.ADMIN);

    for (const userId of adminUserIds) {
      const admin = new this.AdminModel({
        user_id: userId,
        title: faker.helpers.arrayElement(["IT Admin", "Ops Admin", "Finance Admin", "HR Admin"]),
        notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.4 }),
        hire_date: faker.date.past({ years: 5 }),
      });

      const savedAdmin = await admin.save();
      this.ids.admins.push(savedAdmin._id);
      admins.push(savedAdmin);
    }

    console.log(`Generated ${admins.length} admins`);
  }

  private async generateStaff(): Promise<void> {
    console.log("Generating staff...");
    const staff = [];
    // Create Staff docs only for users with role STAFF
    const staffUserIds = this.ids.users.filter((id) => this.userRoleMap.get(String(id)) === Role.STAFF);

    for (const userId of staffUserIds) {
      const staffMember = new this.StaffModel({
        user_id: userId,
        employee_code: `EMP${faker.string.numeric(4)}`,
        position: faker.helpers.arrayElement(["Station Manager", "Technician", "Customer Service", "Operations"]),
        hire_date: faker.date.past({ years: 3 }),
      });

      const savedStaff = await staffMember.save();
      this.ids.staff.push(savedStaff._id);
      staff.push(savedStaff);
    }

    console.log(`Generated ${staff.length} staff`);
  }

  private async generateRenters(): Promise<void> {
    console.log("Generating renters...");
    const renters = [];
    // Create Renter docs only for users with role RENTER
    const renterUserIds = this.ids.users.filter((id) => this.userRoleMap.get(String(id)) === Role.RENTER);

    for (const userId of renterUserIds) {
      const renter = new this.RenterModel({
        user_id: userId,
        driver_license_no: faker.helpers.maybe(() => faker.string.alphanumeric(12).toUpperCase(), { probability: 0.8 }),
        address: faker.location.streetAddress(),
        date_of_birth: faker.date.birthdate({ min: 18, max: 70, mode: "age" }),
        risk_score: faker.number.int({ min: 0, max: 100 }),
      });

      const savedRenter = await renter.save();
      this.ids.renters.push(savedRenter._id);
      renters.push(savedRenter);
    }

    console.log(`Generated ${renters.length} renters`);
  }

  private async generateVehicleAtStations(): Promise<void> {
    console.log("Generating vehicle at stations...");
    const vehicleAtStations = [];

    // Each vehicle can be at a station
    for (const vehicleId of this.ids.vehicles) {
      const stationId = faker.helpers.arrayElement(this.ids.stations);
      const startTime = faker.date.past({ years: 1 });

      const vehicleAtStation = new this.VehicleAtStationModel({
        vehicle_id: vehicleId,
        station_id: stationId,
        start_time: startTime,
        end_time: faker.helpers.maybe(() => faker.date.future({ years: 1 }), { probability: 0.2 }),
        current_battery_capacity_kwh: faker.number.int({ min: 10, max: 100 }),
        current_mileage: faker.number.int({ min: 0, max: 50000 }),
        status: faker.helpers.arrayElement(Object.values(StatusVehicleAtStation)),
      });

      const savedVehicleAtStation = await vehicleAtStation.save();
      this.ids.vehicleAtStations.push(savedVehicleAtStation._id);
      vehicleAtStations.push(savedVehicleAtStation);
    }

    console.log(`Generated ${vehicleAtStations.length} vehicle at stations`);
  }

  private async generateBookings(): Promise<void> {
    console.log("Generating bookings...");
    const bookings = [];
    const bookingCount = 200;

    for (let i = 0; i < bookingCount; i++) {
      const renterId = faker.helpers.arrayElement(this.ids.renters);
      const vehicleAtStationId = faker.helpers.arrayElement(this.ids.vehicleAtStations);

      const booking = new this.BookingModel({
        renter_id: renterId,
        vehicle_at_station_id: vehicleAtStationId,
        expected_return_datetime: faker.date.future(),
        status: faker.helpers.arrayElement(Object.values(BookingStatus)),
        verification_status: faker.helpers.arrayElement(Object.values(BookingVerificationStatus)),
        verified_by_staff_id: faker.helpers.maybe(() => faker.helpers.arrayElement(this.ids.staff), { probability: 0.7 }),
        verified_at: faker.helpers.maybe(() => faker.date.recent(), { probability: 0.7 }),
        cancel_reason: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.1 }),
        total_booking_fee_amount: faker.number.int({ min: 50000, max: 200000 }), // VND
        deposit_fee_amount: faker.number.int({ min: 100000, max: 500000 }),
        rental_fee_amount: faker.number.int({ min: 100000, max: 1000000 }),
      });

      const savedBooking = await booking.save();
      this.ids.bookings.push(savedBooking._id);
      bookings.push(savedBooking);
    }

    console.log(`Generated ${bookings.length} bookings`);
  }

  private async generateRentals(): Promise<void> {
    console.log("Generating rentals...");
    const rentals = [];

    // Create rentals for some bookings
    const rentalCount = Math.floor(this.ids.bookings.length * 0.8); // 80% of bookings become rentals

    for (let i = 0; i < rentalCount; i++) {
      const bookingId = this.ids.bookings[i];
      const booking = await this.BookingModel.findById(bookingId);
      if (!booking) continue;

      const vehicleAtStation = await this.VehicleAtStationModel.findById(booking.vehicle_at_station_id);
      if (!vehicleAtStation) continue;

      const vehicleId = vehicleAtStation.vehicle_id;

      const pickupDatetime = faker.date.recent();
      const expectedReturnDatetime = faker.date.future();

      const rental = new this.RentalModel({
        booking_id: bookingId,
        vehicle_id: vehicleId,
        pickup_datetime: pickupDatetime,
        expected_return_datetime: expectedReturnDatetime,
        actual_return_datetime: faker.helpers.maybe(() => faker.date.recent(), { probability: 0.6 }),
        status: faker.helpers.arrayElement(Object.values(RentalStatus)),
        score: faker.helpers.maybe(() => faker.number.int({ min: 1, max: 5 }), { probability: 0.4 }),
        comment: faker.helpers.maybe(() => faker.lorem.sentences(2), { probability: 0.3 }),
        rated_at: faker.helpers.maybe(() => faker.date.recent(), { probability: 0.4 }),
      });

      const savedRental = await rental.save();
      this.ids.rentals.push(savedRental._id);
      rentals.push(savedRental);
    }

    console.log(`Generated ${rentals.length} rentals`);
  }

  private async generatePayments(): Promise<void> {
    console.log("Generating payments...");
    const payments = [];
    const paymentCount = this.ids.bookings.length;

    for (let i = 0; i < paymentCount; i++) {
      const payment = new this.PaymentModel({
        method: faker.helpers.arrayElement(Object.values(PaymentMethod)),
        status: faker.helpers.arrayElement(Object.values(PaymentStatus)),
        amount_paid: faker.number.int({ min: 50000, max: 1500000 }),
        transaction_code: faker.helpers.maybe(() => faker.string.alphanumeric(16).toUpperCase(), { probability: 0.8 }),
      });

      const savedPayment = await payment.save();
      this.ids.payments.push(savedPayment._id);
      payments.push(savedPayment);
    }

    console.log(`Generated ${payments.length} payments`);
  }

  private async generateFees(): Promise<void> {
    console.log("Generating fees...");
    const fees = [];
    const feeCount = 100;

    for (let i = 0; i < feeCount; i++) {
      const fee = new this.FeeModel({
        booking_id: faker.helpers.arrayElement(this.ids.bookings),
        type: faker.helpers.arrayElement(Object.values(FeeType)),
        amount: faker.number.int({ min: 10000, max: 500000 }),
        description: faker.lorem.sentence(),
      });

      fees.push(await fee.save());
    }

    console.log(`Generated ${fees.length} fees`);
  }

  private async generatePricings(): Promise<void> {
    console.log("Generating pricings...");
    const pricings = [];
    const vehiclesForPricing = faker.helpers.shuffle(this.ids.vehicles).slice(0, 20);

    for (const vehicleId of vehiclesForPricing) {
      const effectiveFrom = faker.date.past({ years: 1 });
      const maybeTo = faker.helpers.maybe(() => faker.date.future({ years: 1, refDate: effectiveFrom }), { probability: 0.3 });
      const pricing = new this.PricingModel({
        vehicle_id: vehicleId,
        price_per_hour: faker.number.int({ min: 50000, max: 200000 }),
        price_per_day: faker.helpers.maybe(() => faker.number.int({ min: 300000, max: 1200000 }), { probability: 0.6 }),
        effective_from: effectiveFrom,
        effective_to: maybeTo ?? undefined,
        deposit_amount: faker.number.int({ min: 500000, max: 3000000 }),
        late_return_fee_per_hour: faker.helpers.maybe(() => faker.number.int({ min: 10000, max: 70000 }), { probability: 0.7 }),
        mileage_limit_per_day: faker.helpers.maybe(() => faker.number.int({ min: 100, max: 400 }), { probability: 0.5 }),
        excess_mileage_fee: faker.helpers.maybe(() => faker.number.int({ min: 1000, max: 10000 }), { probability: 0.5 }),
      });

      pricings.push(await pricing.save());
    }

    console.log(`Generated ${pricings.length} pricings`);
  }

  private async generateKycs(): Promise<void> {
    console.log("Generating KYC records...");
    const kycs = [];

    for (const renterId of this.ids.renters.slice(0, 50)) {
      // First 50 renters have KYC
      const submittedAt = faker.date.recent({ days: 60 });
      const kyc = new this.KycsModel({
        renter_id: renterId,
        type: faker.helpers.arrayElement(Object.values(KycType)),
        document_number: faker.string.numeric(12),
        expiry_date: faker.date.future({ years: 5 }),
        status: faker.helpers.arrayElement(Object.values(KycStatus)),
        submitted_at: submittedAt,
        verified_at: faker.helpers.maybe(() => faker.date.between({ from: submittedAt, to: new Date() }), { probability: 0.7 }),
      });

      kycs.push(await kyc.save());
    }

    console.log(`Generated ${kycs.length} KYC records`);
  }

  private async generateInspections(): Promise<void> {
    console.log("Generating inspections...");
    const inspections = [];
    const inspectionCount = 150;

    for (let i = 0; i < inspectionCount; i++) {
      const inspection = new this.InspectionModel({
        rental_id: faker.helpers.arrayElement(this.ids.rentals),
        type: faker.helpers.arrayElement(Object.values(InspectionType)),
        inspected_at: faker.date.recent(),
        inspector_staff_id: faker.helpers.maybe(() => faker.helpers.arrayElement(this.ids.staff), { probability: 0.8 }),
        current_battery_capacity_kwh: faker.number.int({ min: 10, max: 100 }),
        current_mileage: faker.number.int({ min: 0, max: 50000 }),
      });

      inspections.push(await inspection.save());
    }

    console.log(`Generated ${inspections.length} inspections`);
  }

  private async generateReports(): Promise<void> {
    console.log("Generating reports...");
    const reports = [];
    const inspections = await this.InspectionModel.find({}).exec();
    for (const inspection of inspections) {
      // Not every inspection yields a report
      if (!this.bool(0.6)) continue;
      const damageFound = this.bool(0.3);
      const isOverDeposit = damageFound && this.bool(0.4);
      const report = new this.ReportModel({
        inspection_id: inspection._id,
        damage_notes: faker.helpers.maybe(() => faker.lorem.sentences(2), { probability: damageFound ? 0.8 : 0.2 }),
        damage_found: damageFound,
        damage_price: damageFound ? faker.number.int({ min: 100000, max: 5000000 }) : 0,
        is_over_deposit: isOverDeposit,
        over_deposit_fee_amount: isOverDeposit ? faker.number.int({ min: 50000, max: 1000000 }) : 0,
      });

      reports.push(await report.save());
    }

    console.log(`Generated ${reports.length} reports`);
  }

  private async generateReportsPhotos(): Promise<void> {
    console.log("Generating report photos...");
    const reportsPhotos = [];

    // Create photos for inspections, optionally link report when it exists
    const [inspections, reports] = await Promise.all([this.InspectionModel.find({}).exec(), this.ReportModel.find({}).exec()]);
    const inspectionIdToReportId = new Map<string, mongoose.Types.ObjectId>();
    for (const r of reports) {
      inspectionIdToReportId.set(String(r.inspection_id), r._id);
    }
    for (const inspection of inspections) {
      const photoCount = faker.number.int({ min: 0, max: 4 });
      for (let i = 0; i < photoCount; i++) {
        const reportPhoto = new this.ReportsPhotoModel({
          inspection_id: inspection._id,
          report_id: inspectionIdToReportId.get(String(inspection._id)),
          url: faker.image.url(),
          label: faker.helpers.maybe(() => faker.lorem.words(3), { probability: 0.5 }),
        });
        reportsPhotos.push(await reportPhoto.save());
      }
    }

    console.log(`Generated ${reportsPhotos.length} report photos`);
  }

  private async generateStaffAtStations(): Promise<void> {
    console.log("Generating staff at stations...");
    const staffAtStations = [];

    // Assign staff to stations
    for (const staffId of this.ids.staff) {
      const stationId = faker.helpers.arrayElement(this.ids.stations);
      const startDate = faker.date.past({ years: 2 });

      const staffAtStation = new this.StaffAtStationModel({
        staff_id: staffId,
        station_id: stationId,
        start_time: startDate,
        end_time: faker.helpers.maybe(() => faker.date.future({ years: 1 }), { probability: 0.1 }),
        role_at_station: faker.helpers.arrayElement(["Manager", "Technician", "Attendant", "Supervisor"]),
      });

      staffAtStations.push(await staffAtStation.save());
    }

    console.log(`Generated ${staffAtStations.length} staff at stations`);
  }

  private async generateStaffTransfers(): Promise<void> {
    console.log("Generating staff transfers...");
    const staffTransfers = [];
    const transferCount = 20;

    for (let i = 0; i < transferCount; i++) {
      const staffTransfer = new this.StaffTransferModel({
        staff_id: faker.helpers.arrayElement(this.ids.staff),
        from_station_id: faker.helpers.arrayElement(this.ids.stations),
        to_station_id: faker.helpers.arrayElement(this.ids.stations),
        created_by_admin_id: faker.helpers.arrayElement(this.ids.admins),
        approved_by_admin_id: faker.helpers.maybe(() => faker.helpers.arrayElement(this.ids.admins), { probability: 0.5 }),
        approved_at: faker.helpers.maybe(() => faker.date.recent(), { probability: 0.5 }),
        effective_from: faker.date.future(),
        status: faker.helpers.arrayElement(Object.values(StaffTransferStatus)),
        notes: faker.helpers.maybe(() => faker.lorem.sentences(2), { probability: 0.6 }),
      });

      staffTransfers.push(await staffTransfer.save());
    }

    console.log(`Generated ${staffTransfers.length} staff transfers`);
  }

  private async generateContracts(): Promise<void> {
    console.log("Generating contracts...");
    const contracts = [];

    for (const rentalId of this.ids.rentals.slice(0, 50)) {
      // First 50 rentals have contracts
      const contract = new this.ContractModel({
        rental_id: rentalId,
        completed_at: faker.helpers.maybe(() => faker.date.recent({ days: 30 }), { probability: 0.8 }),
        document_url: faker.internet.url(),
      });

      contracts.push(await contract.save());
    }

    console.log(`Generated ${contracts.length} contracts`);
  }

  private async generateVehicleTransfers(): Promise<void> {
    console.log("Generating vehicle transfers...");
    const vehicleTransfers = [];
    const transferCount = 30;

    for (let i = 0; i < transferCount; i++) {
      const vehicleTransfer = new this.VehicleTransferModel({
        vehicle_id: faker.helpers.arrayElement(this.ids.vehicles),
        from_station_id: faker.helpers.arrayElement(this.ids.stations),
        to_station_id: faker.helpers.arrayElement(this.ids.stations),
        created_by_admin_id: faker.helpers.arrayElement(this.ids.admins),
        approved_by_admin_id: faker.helpers.maybe(() => faker.helpers.arrayElement(this.ids.admins), { probability: 0.6 }),
        approved_at: faker.helpers.maybe(() => faker.date.recent(), { probability: 0.6 }),
        scheduled_pickup_at: faker.helpers.maybe(() => faker.date.future(), { probability: 0.5 }),
        scheduled_dropoff_at: faker.helpers.maybe(() => faker.date.future(), { probability: 0.5 }),
        status: faker.helpers.arrayElement(Object.values(VehicleTransferStatus)),
        notes: faker.helpers.maybe(() => faker.lorem.sentences(2), { probability: 0.6 }),
      });

      vehicleTransfers.push(await vehicleTransfer.save());
    }

    console.log(`Generated ${vehicleTransfers.length} vehicle transfers`);
  }

  private hashPassword(password: string): string {
    // In a real application, you would hash the password
    // For mock data, we'll just return the password as-is
    return password;
  }

  private bool(probability: number): boolean {
    // Generates true with the given probability (0..1)
    return faker.number.float({ min: 0, max: 1 }) < probability;
  }
}

// Main execution
async function main() {
  const generator = new MockDataGenerator();

  try {
    await generator.connect();
    await generator.clearDatabase();
    await generator.generateAllData();
    console.log("All mock data generated successfully!");
  } catch (error) {
    console.error("Error generating mock data:", error);
    process.exit(1);
  } finally {
    await generator.disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error("Error running mock data generator:", error);
    process.exit(1);
  });
}

export { MockDataGenerator };
