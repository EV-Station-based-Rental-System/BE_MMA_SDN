// /* eslint-disable @typescript-eslint/restrict-template-expressions */
// /* eslint-disable @typescript-eslint/no-unsafe-assignment */
// /* eslint-disable @typescript-eslint/no-unsafe-member-access */
// import "dotenv/config";
// import "tsconfig-paths/register";

// import { faker } from "@faker-js/faker";
// import mongoose from "mongoose";

// import { BookingStatus, BookingVerificationStatus } from "../src/common/enums/booking.enum";
// import { FeeType } from "../src/common/enums/fee.enum";
// import { InspectionType } from "../src/common/enums/inspection.enum";
// import { KycStatus, KycType } from "../src/common/enums/kyc.enum";
// import { PaymentMethod, PaymentStatus } from "../src/common/enums/payment.enum";
// import { RentalStatus } from "../src/common/enums/rental.enum";
// import { Role } from "../src/common/enums/role.enum";
// import { VehicleStatus } from "../src/common/enums/vehicle.enum";
// import { Admin, AdminSchema } from "../src/models/admin.schema";
// import { Booking, BookingSchema } from "../src/models/booking.schema";
// import { Contract, ContractSchema } from "../src/models/contract.schema";
// import { Fee, FeeSchema } from "../src/models/fee.schema";
// import { Inspection, InspectionSchema } from "../src/models/inspections.schema";
// import { Kycs, KycsSchema } from "../src/models/kycs.schema";
// import { Payment, PaymentSchema } from "../src/models/payment.schema";
// import { Rental, RentalSchema } from "../src/models/rental.schema";
// import { Renter, RenterSchema } from "../src/models/renter.schema";
// import { Report, ReportSchema } from "../src/models/report.schema";
// import { ReportsPhoto, ReportsPhotoSchema } from "../src/models/reports_photo.schema";
// import { Staff, StaffSchema } from "../src/models/staff.schema";
// import { Station, StationSchema } from "../src/models/station.schema";
// import { User, UserSchema } from "../src/models/user.schema";
// import { Vehicle, VehicleSchema } from "../src/models/vehicle.schema";
// import { calculateRentalDays } from "../src/common/utils/helper";

// type ObjectId = mongoose.Types.ObjectId;

// interface MockDataIds {
//   users: ObjectId[];
//   admins: ObjectId[];
//   staff: ObjectId[];
//   renters: ObjectId[];
//   stations: ObjectId[];
//   vehicles: ObjectId[];
//   bookings: ObjectId[];
//   rentals: ObjectId[];
//   payments: ObjectId[];
//   fees: ObjectId[];
//   kycs: ObjectId[];
//   inspections: ObjectId[];
//   reports: ObjectId[];
//   reportsPhotos: ObjectId[];
//   contracts: ObjectId[];
// }

// interface BookingMeta {
//   renterId: ObjectId;
//   vehicleId: ObjectId;
//   start: Date;
//   expectedReturn: Date;
//   status: BookingStatus;
//   verificationStatus: BookingVerificationStatus;
//   totalFee: number;
//   depositFee: number;
//   rentalFee: number;
// }

// interface RentalMeta {
//   bookingId: ObjectId;
//   vehicleId: ObjectId;
//   pickup: Date;
//   expectedReturn: Date;
//   actualReturn?: Date;
//   status: RentalStatus;
// }

// interface InspectionMeta {
//   rentalId: ObjectId;
//   inspectedAt: Date;
//   type: InspectionType;
// }

// interface VehicleMetrics {
//   battery: number;
//   mileage: number;
// }
// interface VehiclePricing {
//   pricePerDay: number;
//   depositAmount: number;
// }

// const DEFAULT_SEED = 12_345;

// const DEFAULT_USER_ROLE_COUNTS: Record<Role, number> = {
//   [Role.ADMIN]: 2,
//   [Role.STAFF]: 6,
//   [Role.RENTER]: 10,
//   [Role.UNKNOWN]: 0,
// };

// const DEFAULT_COUNTS = {
//   stations: 10,
//   vehicles: 20,
//   bookings: 20,
//   kycs: 10,
// } as const;

// const DEFAULT_TOGGLES = {
//   kycs: false,
//   inspections: false,
//   reports: false,
//   reportPhotos: false,
//   contracts: false,
// } as const;

// type DefaultCounts = typeof DEFAULT_COUNTS;
// type ToggleKey = keyof typeof DEFAULT_TOGGLES;

// type MockDataMode = "happy" | "mixed";

// interface MockGeneratorOptions {
//   counts?: Partial<Record<keyof DefaultCounts, number>>;
//   userRoleCounts?: Partial<Record<Role, number>>;
//   toggles?: Partial<Record<ToggleKey, boolean>>;
//   mode?: MockDataMode;
// }

// interface InternalConfig {
//   userRoleCounts: Record<Role, number>;
//   counts: Record<keyof DefaultCounts, number>;
//   toggles: Record<ToggleKey, boolean>;
// }

// class MockDataGenerator {
//   private roundToHour(date: Date): Date {
//     const d = new Date(date);
//     d.setMinutes(0, 0, 0);
//     return d;
//   }

//   private addDays(date: Date, days: number): Date {
//     const durationHours = Math.max(days, 1) * 24;
//     const clone = new Date(date);
//     clone.setHours(clone.getHours() + durationHours);
//     return this.roundToHour(clone);
//   }

//   private readonly config: InternalConfig;
//   private readonly mode: MockDataMode;

//   private readonly ids: MockDataIds = {
//     users: [],
//     admins: [],
//     staff: [],
//     renters: [],
//     stations: [],
//     vehicles: [],
//     bookings: [],
//     rentals: [],
//     payments: [],
//     fees: [],
//     kycs: [],
//     inspections: [],
//     reports: [],
//     reportsPhotos: [],
//     contracts: [],
//   };

//   private readonly userRoleMap = new Map<string, Role>();
//   private readonly bookingMeta = new Map<string, BookingMeta>();
//   private readonly rentalMeta = new Map<string, RentalMeta>();
//   private readonly inspectionMeta = new Map<string, InspectionMeta>();
//   private readonly reportByInspection = new Map<string, ObjectId>();
//   private readonly vehicleMetrics = new Map<string, VehicleMetrics>();
//   private readonly vehicleLicensePlates = new Set<string>();
//   private readonly vehiclePricing = new Map<string, VehiclePricing>();

//   private readonly UserModel = (mongoose.models[User.name] as mongoose.Model<User>) ?? mongoose.model<User>(User.name, UserSchema);
//   private readonly AdminModel = (mongoose.models[Admin.name] as mongoose.Model<Admin>) ?? mongoose.model<Admin>(Admin.name, AdminSchema);
//   private readonly StaffModel = (mongoose.models[Staff.name] as mongoose.Model<Staff>) ?? mongoose.model<Staff>(Staff.name, StaffSchema);
//   private readonly RenterModel = (mongoose.models[Renter.name] as mongoose.Model<Renter>) ?? mongoose.model<Renter>(Renter.name, RenterSchema);
//   private readonly VehicleModel = (mongoose.models[Vehicle.name] as mongoose.Model<Vehicle>) ?? mongoose.model<Vehicle>(Vehicle.name, VehicleSchema);
//   private readonly StationModel = (mongoose.models[Station.name] as mongoose.Model<Station>) ?? mongoose.model<Station>(Station.name, StationSchema);
//   private readonly BookingModel = (mongoose.models[Booking.name] as mongoose.Model<Booking>) ?? mongoose.model<Booking>(Booking.name, BookingSchema);
//   private readonly RentalModel = (mongoose.models[Rental.name] as mongoose.Model<Rental>) ?? mongoose.model<Rental>(Rental.name, RentalSchema);
//   private readonly PaymentModel = (mongoose.models[Payment.name] as mongoose.Model<Payment>) ?? mongoose.model<Payment>(Payment.name, PaymentSchema);
//   private readonly FeeModel = (mongoose.models[Fee.name] as mongoose.Model<Fee>) ?? mongoose.model<Fee>(Fee.name, FeeSchema);
//   private readonly KycsModel = (mongoose.models[Kycs.name] as mongoose.Model<Kycs>) ?? mongoose.model<Kycs>(Kycs.name, KycsSchema);
//   private readonly InspectionModel =
//     (mongoose.models[Inspection.name] as mongoose.Model<Inspection>) ?? mongoose.model<Inspection>(Inspection.name, InspectionSchema);
//   private readonly ReportModel = (mongoose.models[Report.name] as mongoose.Model<Report>) ?? mongoose.model<Report>(Report.name, ReportSchema);
//   private readonly ReportsPhotoModel =
//     (mongoose.models[ReportsPhoto.name] as mongoose.Model<ReportsPhoto>) ?? mongoose.model<ReportsPhoto>(ReportsPhoto.name, ReportsPhotoSchema);
//   private readonly ContractModel =
//     (mongoose.models[Contract.name] as mongoose.Model<Contract>) ?? mongoose.model<Contract>(Contract.name, ContractSchema);

//   constructor(seed?: number, options?: MockGeneratorOptions) {
//     const envSeed =
//       typeof process.env.MOCK_DATA_SEED === "string" && !Number.isNaN(Number(process.env.MOCK_DATA_SEED))
//         ? Number(process.env.MOCK_DATA_SEED)
//         : undefined;
//     const resolvedSeed = seed ?? envSeed ?? DEFAULT_SEED;
//     faker.seed(resolvedSeed);
//     this.mode = options?.mode ?? "happy";

//     const toggles = {
//       ...DEFAULT_TOGGLES,
//       ...options?.toggles,
//     };

//     if (this.mode === "happy") {
//       toggles.reports = options?.toggles?.reports ?? false;
//       toggles.reportPhotos = options?.toggles?.reportPhotos ?? false;
//     }

//     this.config = {
//       userRoleCounts: {
//         ...DEFAULT_USER_ROLE_COUNTS,
//         ...options?.userRoleCounts,
//       },
//       counts: {
//         stations: this.normalizeCount(options?.counts?.stations, DEFAULT_COUNTS.stations),
//         vehicles: this.normalizeCount(options?.counts?.vehicles, DEFAULT_COUNTS.vehicles),
//         bookings: this.normalizeCount(options?.counts?.bookings, DEFAULT_COUNTS.bookings),
//         kycs: this.normalizeCount(options?.counts?.kycs, DEFAULT_COUNTS.kycs),
//       },
//       toggles,
//     };
//   }

//   async connect(): Promise<void> {
//     const mongoUri = process.env.MONGO_URI;
//     if (!mongoUri) {
//       throw new Error("MONGO_URI is not set");
//     }

//     await mongoose.connect(mongoUri);
//     console.log("Connected to MongoDB");
//   }

//   async disconnect(): Promise<void> {
//     await mongoose.disconnect();
//     console.log("Disconnected from MongoDB");
//   }

//   async clearDatabase(): Promise<void> {
//     const collections = mongoose.connection.collections;
//     for (const collection of Object.values(collections)) {
//       await collection.deleteMany({});
//     }
//     this.resetCaches();
//     console.log("Database cleared");
//   }

//   async generateAllData(options?: { clearExisting?: boolean }): Promise<void> {
//     console.log("Starting mock data generation...");

//     if (options?.clearExisting) {
//       // await this.clearDatabase();
//     }

//     // await this.generateUsers();
//     // await this.generateAdmins();
//     // await this.generateRenters();
//     // await this.generateStations();
//     // await this.generateStaff();
//     await this.generateVehicles();
//     // await this.generateBookings();
//     // await this.generateRentals();
//     // await this.generatePayments();
//     // await this.generateFees();

//     if (this.config.toggles.kycs) {
//       await this.generateKycs();
//     }
//     if (this.config.toggles.inspections) {
//       await this.generateInspections();
//       if (this.config.toggles.reports) {
//         await this.generateReports();
//         if (this.config.toggles.reportPhotos) {
//           await this.generateReportsPhotos();
//         }
//       }
//     }
//     if (this.config.toggles.contracts) {
//       await this.generateContracts();
//     }

//     console.log("Mock data generation completed!");
//   }

//   private async generateUsers(): Promise<void> {
//     console.log("Loading users...");
//     const existing = await this.UserModel.find({}, { _id: 1, role: 1 }).lean().exec();

//     if (existing.length) {
//       for (const user of existing) {
//         const role = user.role ?? Role.UNKNOWN;
//         this.ids.users.push(user._id);
//         this.userRoleMap.set(String(user._id), role);
//       }
//       console.log(`Loaded ${existing.length} users`);
//       return;
//     }

//     console.warn("No users found; generating mock users...");
//     const userDocs: Array<Partial<User>> = [];
//     for (const [role, count] of Object.entries(this.config.userRoleCounts) as Array<[Role, number]>) {
//       if (count <= 0) continue;
//       for (let i = 0; i < count; i += 1) {
//         const firstName = faker.person.firstName();
//         const lastName = faker.person.lastName();
//         userDocs.push({
//           email: faker.internet.email({ firstName, lastName, provider: "example.com" }).toLowerCase(),
//           password: this.hashPassword("secretPassword"),
//           full_name: `${firstName} ${lastName}`,
//           role,
//           is_active: this.bool(0.92),
//           phone: this.bool(0.7) ? this.randomVietnamPhone() : undefined,
//         });
//       }
//     }

//     const created = await this.UserModel.insertMany(userDocs, { ordered: true });
//     for (const doc of created) {
//       const role = doc.role ?? Role.UNKNOWN;
//       this.ids.users.push(doc._id);
//       this.userRoleMap.set(String(doc._id), role);
//     }

//     console.log(`Generated ${created.length} users`);
//   }

//   private async generateAdmins(): Promise<void> {
//     console.log("Loading admin documents...");
//     const existing = await this.AdminModel.find({}, { _id: 1, user_id: 1 }).lean().exec();
//     const existingUserIds = new Set<string>();

//     if (existing.length) {
//       for (const admin of existing) {
//         this.ids.admins.push(admin._id);
//         if (admin.user_id) {
//           existingUserIds.add(String(admin.user_id));
//           this.userRoleMap.set(String(admin.user_id), Role.ADMIN);
//         }
//       }
//       console.log(`Loaded ${existing.length} admins`);
//     }

//     const adminUserIds = this.getUserIdsByRole(Role.ADMIN).filter((id) => !existingUserIds.has(String(id)));
//     if (!adminUserIds.length) {
//       if (!existing.length) {
//         console.warn("No admin users available; skipping admin document generation.");
//       }
//       return;
//     }

//     const adminDocs: Array<Partial<Admin>> = adminUserIds.map((userId) => ({
//       user_id: userId,
//       title: faker.helpers.arrayElement(["IT Admin", "Operations Admin", "Finance Admin", "Support Admin"]),
//       notes: this.bool(0.35) ? faker.lorem.sentence() : undefined,
//       hire_date: faker.date.past({ years: 5 }),
//     }));

//     const created = await this.AdminModel.insertMany(adminDocs, { ordered: true });
//     for (const doc of created) {
//       this.ids.admins.push(doc._id);
//       this.userRoleMap.set(String(doc.user_id), Role.ADMIN);
//     }

//     console.log(`Generated ${created.length} admins`);
//   }

//   private async generateStaff(): Promise<void> {
//     console.log("Loading staff documents...");
//     const existing = await this.StaffModel.find({}, { _id: 1, user_id: 1 }).lean().exec();
//     const existingUserIds = new Set<string>();

//     if (existing.length) {
//       for (const staff of existing) {
//         this.ids.staff.push(staff._id);
//         if (staff.user_id) {
//           existingUserIds.add(String(staff.user_id));
//           this.userRoleMap.set(String(staff.user_id), Role.STAFF);
//         }
//       }
//       console.log(`Loaded ${existing.length} staff records`);
//     }

//     const staffUserIds = this.getUserIdsByRole(Role.STAFF).filter((id) => !existingUserIds.has(String(id)));
//     if (!staffUserIds.length) {
//       if (!existing.length) {
//         console.warn("No staff users available; skipping staff document generation.");
//       }
//       return;
//     }

//     let employeeCounter = this.ids.staff.length;
//     const staffDocs: Array<Partial<Staff>> = staffUserIds.map((userId) => ({
//       user_id: userId,
//       station_id: this.requireStationId(),
//       employee_code: `EMP${String(++employeeCounter).padStart(5, "0")}`,
//       position: faker.helpers.arrayElement(["Station Manager", "Technician", "Customer Support", "Ops Specialist"]),
//       hire_date: faker.date.past({ years: 4 }),
//     }));

//     const created = await this.StaffModel.insertMany(staffDocs, { ordered: true });
//     for (const doc of created) {
//       this.ids.staff.push(doc._id);
//       this.userRoleMap.set(String(doc.user_id), Role.STAFF);
//     }

//     console.log(`Generated ${created.length} staff records`);
//   }

//   private async generateRenters(): Promise<void> {
//     console.log("Loading renter documents...");
//     const existing = await this.RenterModel.find({}, { _id: 1, user_id: 1 }).lean().exec();
//     const existingUserIds = new Set<string>();

//     if (existing.length) {
//       for (const renter of existing) {
//         this.ids.renters.push(renter._id);
//         if (renter.user_id) {
//           existingUserIds.add(String(renter.user_id));
//           this.userRoleMap.set(String(renter.user_id), Role.RENTER);
//         }
//       }
//       console.log(`Loaded ${existing.length} renters`);
//     }

//     const renterUserIds = this.getUserIdsByRole(Role.RENTER).filter((id) => !existingUserIds.has(String(id)));
//     if (!renterUserIds.length) {
//       if (!existing.length) {
//         console.warn("No renter users available; skipping renter document generation.");
//       }
//       return;
//     }

//     const renterDocs: Array<Partial<Renter>> = renterUserIds.map((userId) => ({
//       user_id: userId,
//       address: faker.location.streetAddress(),
//       date_of_birth: faker.date.birthdate({ min: 21, max: 65, mode: "age" }),
//       risk_score: faker.number.int({ min: 0, max: 100 }),
//     }));

//     const created = await this.RenterModel.insertMany(renterDocs, { ordered: true });
//     for (const doc of created) {
//       this.ids.renters.push(doc._id);
//       this.userRoleMap.set(String(doc.user_id), Role.RENTER);
//     }

//     console.log(`Generated ${created.length} renters`);
//   }

//   private async generateStations(): Promise<void> {
//     console.log("Loading stations...");
//     const existing = await this.StationModel.find({}, { _id: 1 }).lean().exec();
//     for (const station of existing) {
//       this.ids.stations.push(station._id);
//     }

//     if (existing.length >= this.config.counts.stations) {
//       console.log(`Loaded ${existing.length} stations`);
//       return;
//     }

//     const toCreate = this.config.counts.stations - existing.length;
//     console.warn(`Creating ${toCreate} station(s) to reach target of ${this.config.counts.stations}...`);

//     const cities = [
//       "Hanoi",
//       "Ho Chi Minh City",
//       "Da Nang",
//       "Hai Phong",
//       "Can Tho",
//       "Bien Hoa",
//       "Nha Trang",
//       "Hue",
//       "Vung Tau",
//       "Ha Long",
//       "Buon Ma Thuot",
//       "Da Lat",
//     ];

//     const stationDocs: Array<Partial<Station>> = [];
//     for (let i = 0; i < toCreate; i += 1) {
//       const city = faker.helpers.arrayElement(cities);
//       stationDocs.push({
//         name: `${city} EV Hub ${existing.length + i + 1}`,
//         address: faker.location.streetAddress(),
//         latitude: faker.location.latitude({ min: 8, max: 23.5 }),
//         longitude: faker.location.longitude({ min: 102, max: 110 }),
//         is_active: this.bool(0.95),
//       });
//     }

//     const created = await this.StationModel.insertMany(stationDocs, { ordered: true });
//     for (const doc of created) {
//       this.ids.stations.push(doc._id);
//     }

//     console.log(`Generated ${created.length} stations (total: ${this.ids.stations.length})`);
//   }

//   private async generateVehicles(): Promise<void> {
//     console.log("Loading vehicles...");
//     const existing = await this.VehicleModel.find(
//       {},
//       {
//         _id: 1,
//         current_battery_capacity_kwh: 1,
//         current_mileage: 1,
//         price_per_day: 1,
//         deposit_amount: 1,
//         price_per_hour: 1,
//         license_plate: 1,
//       },
//     )
//       .lean()
//       .exec();

//     for (const vehicle of existing) {
//       this.ids.vehicles.push(vehicle._id);
//       const battery = typeof vehicle.current_battery_capacity_kwh === "number" ? vehicle.current_battery_capacity_kwh : 80;
//       const mileage = typeof vehicle.current_mileage === "number" ? vehicle.current_mileage : 10_000;
//       this.vehicleMetrics.set(String(vehicle._id), { battery, mileage });

//       const fallbackDay =
//         typeof (vehicle as any).price_per_hour === "number"
//           ? Math.max(100_000, ((vehicle as any).price_per_hour as number) * 8)
//           : this.money(350_000, 1_200_000);
//       const pricePerDay = typeof (vehicle as any).price_per_day === "number" ? (vehicle as any).price_per_day : fallbackDay;
//       const depositAmount = typeof (vehicle as any).deposit_amount === "number" ? (vehicle as any).deposit_amount : this.money(500_000, 5_000_000);
//       this.vehiclePricing.set(String(vehicle._id), { pricePerDay, depositAmount });

//       const rawLicense = (vehicle as { license_plate?: unknown }).license_plate;
//       if (typeof rawLicense === "string") {
//         const normalizedPlate = rawLicense.trim().toUpperCase();
//         if (normalizedPlate) {
//           this.vehicleLicensePlates.add(normalizedPlate);
//         }
//       }
//     }

//     if (existing.length >= this.config.counts.vehicles) {
//       console.log(`Loaded ${existing.length} vehicles`);
//       return;
//     }

//     const toCreate = this.config.counts.vehicles - existing.length;
//     console.warn(`Creating ${toCreate} vehicle(s) to reach target of ${this.config.counts.vehicles}...`);

//     const makes = ["Tesla", "VinFast", "Nissan", "BMW", "Audi", "Hyundai", "Kia", "Toyota", "BYD", "Mercedes-Benz"];
//     const models = ["Model 3", "VF8", "Leaf", "i3", "e-tron", "Ioniq 5", "EV6", "bZ4X", "Han", "EQB"];

//     const vehicleDocs: Array<Partial<Vehicle>> = [];
//     for (let i = 0; i < toCreate; i += 1) {
//       const make = faker.helpers.arrayElement(makes);
//       const model = faker.helpers.arrayElement(models);
//       const batteryCapacity = faker.number.int({ min: 45, max: 110 });
//       const currentBattery = faker.number.int({ min: Math.max(10, batteryCapacity - 70), max: batteryCapacity });
//       const currentMileage = faker.number.int({ min: 0, max: 80_000 });
//       const pricePerHour = this.money(60_000, 240_000);
//       const pricePerDay = this.money(pricePerHour * 6, pricePerHour * 10);
//       const depositAmount = this.money(500_000, 5_000_000);
//       const licensePlate = this.generateLicensePlate();

//       vehicleDocs.push({
//         station_id: this.ids.stations.length ? faker.helpers.arrayElement(this.ids.stations) : undefined,
//         make,
//         model,
//         model_year: faker.number.int({ min: 2018, max: 2025 }),
//         category: "EV",
//         battery_capacity_kwh: batteryCapacity,
//         range_km: faker.number.int({ min: 220, max: 520 }),
//         vin_number: this.bool(0.85) ? `VN${faker.string.alphanumeric({ length: 15, casing: "upper" })}` : undefined,
//         license_plate: licensePlate,
//         img_url: this.bool(0.55) ? faker.image.url() : undefined,
//         is_active: this.bool(0.95),
//         current_battery_capacity_kwh: currentBattery,
//         current_mileage: currentMileage,
//         status: this.randomVehicleStatus(),
//         price_per_hour: pricePerHour,
//         price_per_day: pricePerDay,
//         deposit_amount: depositAmount,
//       });
//     }

//     const created = await this.VehicleModel.insertMany(vehicleDocs, { ordered: true });
//     for (const doc of created) {
//       this.ids.vehicles.push(doc._id);
//       const battery = doc.current_battery_capacity_kwh ?? 75;
//       const mileage = doc.current_mileage ?? 8_000;
//       this.vehicleMetrics.set(String(doc._id), { battery, mileage });
//       this.vehiclePricing.set(String(doc._id), {
//         pricePerDay:
//           doc.price_per_day ?? Math.max(100_000, (doc as any).price_per_hour ? (doc as any).price_per_hour * 8 : this.money(350_000, 1_200_000)),
//         depositAmount: doc.deposit_amount ?? this.money(500_000, 5_000_000),
//       });
//     }

//     console.log(`Generated ${created.length} vehicles (total: ${this.ids.vehicles.length})`);
//   }

//   private async generateBookings(): Promise<void> {
//     console.log("Loading bookings...");
//     if (!this.ids.renters.length || !this.ids.vehicles.length) {
//       console.warn("Skipping bookings: renters or vehicles are missing.");
//       return;
//     }

//     const existing = await this.BookingModel.find(
//       {},
//       {
//         _id: 1,
//         renter_id: 1,
//         vehicle_id: 1,
//         rental_start_datetime: 1,
//         expected_return_datetime: 1,
//         status: 1,
//         verification_status: 1,
//         total_booking_fee_amount: 1,
//         deposit_fee_amount: 1,
//         rental_fee_amount: 1,
//       },
//     )
//       .lean()
//       .exec();

//     for (const booking of existing) {
//       this.ids.bookings.push(booking._id);
//       const startDate = booking.rental_start_datetime ?? faker.date.recent({ days: 60 });
//       const roundedStart = this.roundToHour(startDate);
//       const expectedFallback = this.addDays(roundedStart, 1);
//       let normalizedExpected = this.roundToHour(booking.expected_return_datetime ?? expectedFallback);
//       if (normalizedExpected <= roundedStart) {
//         normalizedExpected = this.addDays(roundedStart, 1);
//       }
//       this.bookingMeta.set(String(booking._id), {
//         renterId: booking.renter_id,
//         vehicleId: booking.vehicle_id,
//         start: roundedStart,
//         expectedReturn: normalizedExpected,
//         status: booking.status,
//         verificationStatus: booking.verification_status,
//         totalFee: booking.total_booking_fee_amount ?? 0,
//         depositFee: booking.deposit_fee_amount ?? 0,
//         rentalFee: booking.rental_fee_amount ?? 0,
//       });
//     }

//     if (existing.length >= this.config.counts.bookings) {
//       console.log(`Loaded ${existing.length} bookings`);
//       return;
//     }

//     const toCreate = this.config.counts.bookings - existing.length;
//     console.warn(`Creating ${toCreate} booking(s) to reach target of ${this.config.counts.bookings}...`);

//     const bookingDocs: Array<Partial<Booking>> = [];
//     for (let i = 0; i < toCreate; i += 1) {
//       const renterId = faker.helpers.arrayElement(this.ids.renters);
//       const vehicleId = faker.helpers.arrayElement(this.ids.vehicles);
//       const start = this.roundToHour(faker.date.recent({ days: 120 }));
//       const plannedRentalDays = faker.number.int({ min: 1, max: 10 });
//       const expectedReturn = this.addDays(start, plannedRentalDays);
//       const verificationStatus = this.randomBookingVerificationStatus();
//       const status = this.resolveBookingStatus(verificationStatus);

//       const pricing = this.vehiclePricing.get(String(vehicleId));
//       const pricePerDay = pricing?.pricePerDay ?? this.money(350_000, 1_200_000);
//       const depositFee = pricing?.depositAmount ?? this.money(500_000, 5_000_000);
//       const rentalDays = calculateRentalDays(start, expectedReturn);
//       const rentalFee = pricePerDay * rentalDays;
//       const totalFee = depositFee + rentalFee;

//       let verifiedBy: ObjectId | undefined;
//       let verifiedAt: Date | undefined;

//       if (this.mode === "happy") {
//         verifiedBy = this.randomStaffId();
//         if (verifiedBy) {
//           const verificationWindowStart = new Date(start.getTime() - 86_400_000);
//           verifiedAt = faker.date.between({ from: verificationWindowStart, to: start });
//         }
//       } else {
//         verifiedBy =
//           verificationStatus === BookingVerificationStatus.APPROVED || verificationStatus === BookingVerificationStatus.REJECTED_OTHER
//             ? this.randomStaffId()
//             : undefined;
//         verifiedAt =
//           verifiedBy && verificationStatus === BookingVerificationStatus.APPROVED
//             ? faker.date.between({ from: start, to: expectedReturn })
//             : undefined;
//       }

//       bookingDocs.push({
//         renter_id: renterId,
//         vehicle_id: vehicleId,
//         rental_start_datetime: start,
//         expected_return_datetime: expectedReturn,
//         status,
//         verification_status: verificationStatus,
//         verified_by_staff_id: verifiedBy,
//         verified_at: verifiedAt,
//         cancel_reason: this.mode === "happy" ? undefined : status === BookingStatus.CANCELLED ? faker.lorem.sentence() : undefined,
//         total_booking_fee_amount: totalFee,
//         deposit_fee_amount: depositFee,
//         rental_fee_amount: rentalFee,
//       });
//     }

//     const created = await this.BookingModel.insertMany(bookingDocs, { ordered: true });
//     for (const doc of created) {
//       this.ids.bookings.push(doc._id);
//       const startDate = doc.rental_start_datetime ?? this.roundToHour(new Date());
//       let expectedReturn = doc.expected_return_datetime ?? this.addDays(startDate, 1);
//       if (expectedReturn <= startDate) {
//         expectedReturn = this.addDays(startDate, 1);
//       }
//       this.bookingMeta.set(String(doc._id), {
//         renterId: doc.renter_id,
//         vehicleId: doc.vehicle_id,
//         start: startDate,
//         expectedReturn,
//         status: doc.status,
//         verificationStatus: doc.verification_status,
//         totalFee: doc.total_booking_fee_amount ?? 0,
//         depositFee: doc.deposit_fee_amount ?? 0,
//         rentalFee: doc.rental_fee_amount ?? 0,
//       });
//     }

//     console.log(`Generated ${created.length} bookings (total: ${this.ids.bookings.length})`);
//   }

//   private async generateRentals(): Promise<void> {
//     console.log("Loading rentals...");
//     if (!this.ids.bookings.length) {
//       console.warn("Skipping rentals: bookings are missing.");
//       return;
//     }

//     const existing = await this.RentalModel.find(
//       {},
//       {
//         _id: 1,
//         booking_id: 1,
//         vehicle_id: 1,
//         pickup_datetime: 1,
//         expected_return_datetime: 1,
//         actual_return_datetime: 1,
//         status: 1,
//         score: 1,
//         comment: 1,
//         rated_at: 1,
//       },
//     )
//       .lean()
//       .exec();

//     const existingBookingIds = new Set<string>();
//     for (const rental of existing) {
//       this.ids.rentals.push(rental._id);
//       existingBookingIds.add(String(rental.booking_id));
//       const pickupDate = rental.pickup_datetime ?? faker.date.recent({ days: 30 });
//       const normalizedPickup = this.roundToHour(pickupDate);
//       let expectedRentalReturn = rental.expected_return_datetime ?? this.addDays(normalizedPickup, 1);
//       if (expectedRentalReturn <= normalizedPickup) {
//         expectedRentalReturn = this.addDays(normalizedPickup, 1);
//       }
//       this.rentalMeta.set(String(rental._id), {
//         bookingId: rental.booking_id,
//         vehicleId: rental.vehicle_id,
//         pickup: normalizedPickup,
//         expectedReturn: this.roundToHour(expectedRentalReturn),
//         actualReturn: rental.actual_return_datetime ?? undefined,
//         status: rental.status,
//       });
//     }

//     const eligibleBookings = this.ids.bookings.filter((bookingId) => {
//       const meta = this.bookingMeta.get(String(bookingId));
//       if (!meta) return false;
//       const isEligible = meta.verificationStatus === BookingVerificationStatus.APPROVED && meta.status === BookingStatus.VERIFIED;
//       return isEligible && !existingBookingIds.has(String(bookingId));
//     });

//     if (!eligibleBookings.length) {
//       console.warn("No eligible bookings available for rental generation.");
//       return;
//     }

//     const targetCount = this.mode === "happy" ? eligibleBookings.length : Math.max(1, Math.floor(eligibleBookings.length * 0.75));
//     const rentalTargets = this.mode === "happy" ? eligibleBookings : faker.helpers.shuffle(eligibleBookings).slice(0, targetCount);

//     const rentalDocs: Array<Partial<Rental>> = [];
//     for (const bookingId of rentalTargets) {
//       const meta = this.bookingMeta.get(String(bookingId));
//       if (!meta) continue;

//       const status = this.randomRentalStatus();
//       const pickup = meta.start;
//       const expectedReturn = meta.expectedReturn;
//       const finished = status === RentalStatus.COMPLETED || status === RentalStatus.LATE;

//       let actualReturn: Date | undefined;
//       if (this.mode === "happy") {
//         const completionWindowEnd = new Date(expectedReturn.getTime() + 4 * 60 * 60 * 1000);
//         actualReturn = faker.date.between({ from: expectedReturn, to: completionWindowEnd });
//       } else if (finished) {
//         const base = status === RentalStatus.LATE ? faker.date.soon({ days: 3, refDate: expectedReturn }) : expectedReturn;
//         actualReturn = faker.date.between({ from: expectedReturn, to: base });
//       }

//       rentalDocs.push({
//         booking_id: bookingId,
//         vehicle_id: meta.vehicleId,
//         pickup_datetime: pickup,
//         expected_return_datetime: expectedReturn,
//         actual_return_datetime: actualReturn,
//         status,
//         score: this.mode === "happy" ? 5 : finished && this.bool(0.85) ? faker.number.int({ min: 3, max: 5 }) : null,
//         comment:
//           this.mode === "happy"
//             ? this.bool(0.5)
//               ? faker.helpers.arrayElement(["Great vehicle condition.", "Smooth ride and excellent service.", "Would happily rent again."])
//               : undefined
//             : finished && this.bool(0.25)
//               ? faker.lorem.sentences(faker.number.int({ min: 1, max: 2 }))
//               : undefined,
//         rated_at:
//           this.mode === "happy"
//             ? faker.date.soon({ days: 2, refDate: actualReturn ?? expectedReturn })
//             : finished && this.bool(0.6)
//               ? faker.date.soon({ days: 3, refDate: actualReturn ?? expectedReturn })
//               : undefined,
//       });
//     }

//     if (!rentalDocs.length) {
//       console.warn("No rental documents created from eligible bookings.");
//       return;
//     }

//     const created = await this.RentalModel.insertMany(rentalDocs, { ordered: true });
//     for (const doc of created) {
//       this.ids.rentals.push(doc._id);
//       const pickupDate = doc.pickup_datetime ?? this.roundToHour(new Date());
//       let expectedReturn = doc.expected_return_datetime ?? this.addDays(pickupDate, 1);
//       if (expectedReturn <= pickupDate) {
//         expectedReturn = this.addDays(pickupDate, 1);
//       }
//       this.rentalMeta.set(String(doc._id), {
//         bookingId: doc.booking_id,
//         vehicleId: doc.vehicle_id,
//         pickup: pickupDate,
//         expectedReturn,
//         actualReturn: doc.actual_return_datetime ?? undefined,
//         status: doc.status,
//       });
//     }

//     console.log(`Generated ${created.length} rentals (total: ${this.ids.rentals.length})`);
//   }

//   private async generatePayments(): Promise<void> {
//     console.log("Loading payments...");
//     const existing = await this.PaymentModel.find({}, { _id: 1, booking_id: 1 }).lean().exec();
//     const bookingWithPayment = new Set(existing.map((payment) => String(payment.booking_id)));

//     for (const payment of existing) {
//       this.ids.payments.push(payment._id);
//     }

//     const bookingsNeedingPayment = this.ids.bookings.filter((bookingId) => !bookingWithPayment.has(String(bookingId)));
//     if (!bookingsNeedingPayment.length) {
//       console.log("All bookings already have payment records.");
//       return;
//     }

//     const paymentDocs: Array<Partial<Payment>> = [];
//     for (const bookingId of bookingsNeedingPayment) {
//       const meta = this.bookingMeta.get(String(bookingId));
//       const rental = this.findRentalMetaByBookingId(bookingId);
//       const status = this.resolvePaymentStatus(meta, Boolean(rental));

//       const targetAmount = meta?.totalFee ?? this.money(200_000, 1_200_000);
//       const amount =
//         this.mode === "happy"
//           ? targetAmount
//           : status === PaymentStatus.PAID
//             ? targetAmount
//             : this.money(Math.min(100_000, targetAmount), Math.max(150_000, targetAmount));

//       const method =
//         this.mode === "happy"
//           ? faker.helpers.arrayElement([PaymentMethod.BANK_TRANSFER, PaymentMethod.CASH])
//           : faker.helpers.arrayElement(Object.values(PaymentMethod));
//       const transactionCode =
//         this.mode === "happy"
//           ? faker.string.alphanumeric({ length: 14, casing: "upper" })
//           : this.bool(0.8)
//             ? faker.string.alphanumeric({ length: 14, casing: "upper" })
//             : undefined;

//       paymentDocs.push({
//         booking_id: bookingId,
//         method,
//         status,
//         amount_paid: amount,
//         transaction_code: transactionCode,
//       });
//     }

//     const created = await this.PaymentModel.insertMany(paymentDocs, { ordered: true });
//     for (const doc of created) {
//       this.ids.payments.push(doc._id);
//     }

//     console.log(`Generated ${created.length} payments (total: ${this.ids.payments.length})`);
//   }

//   private async generateFees(): Promise<void> {
//     console.log("Loading fees...");
//     const existing = await this.FeeModel.find({}, { _id: 1, booking_id: 1, type: 1 }).lean().exec();
//     const existingKeys = new Set(existing.map((fee) => `${fee.booking_id}_${fee.type}`));

//     for (const fee of existing) {
//       this.ids.fees.push(fee._id);
//     }

//     const rentalByBooking = new Map<string, RentalMeta>();
//     for (const meta of this.rentalMeta.values()) {
//       rentalByBooking.set(String(meta.bookingId), meta);
//     }

//     const feeDocs: Array<Partial<Fee>> = [];
//     for (const bookingId of this.ids.bookings) {
//       const meta = this.bookingMeta.get(String(bookingId));
//       if (!meta) continue;

//       const addFee = (type: FeeType, amount: number, description: string): void => {
//         if (amount <= 0) return;
//         const key = `${bookingId}_${type}`;
//         if (existingKeys.has(key)) return;
//         existingKeys.add(key);
//         feeDocs.push({
//           booking_id: bookingId,
//           type,
//           amount,
//           description,
//           currency: "VND",
//         });
//       };

//       addFee(FeeType.DEPOSIT_FEE, meta.depositFee, "Deposit fee");
//       addFee(FeeType.RENTAL_FEE, meta.rentalFee, "Rental fee");

//       const rentalMeta = rentalByBooking.get(String(bookingId));
//       if (this.mode !== "happy" && rentalMeta?.status === RentalStatus.LATE) {
//         addFee(FeeType.LATE_RETURN_FEE, this.money(50_000, 300_000), "Late return adjustment");
//       }

//       if (this.mode === "happy") {
//         addFee(FeeType.TOTAL_BOOKING_FEE, meta.totalFee, "Total booking fee");
//       } else if (meta.status !== BookingStatus.CANCELLED && this.bool(0.35)) {
//         addFee(FeeType.TOTAL_BOOKING_FEE, meta.totalFee, "Total booking fee");
//       }

//       if (this.mode !== "happy" && this.bool(0.2)) {
//         addFee(FeeType.OTHER, this.money(25_000, 160_000), "Miscellaneous fee");
//       }
//     }

//     if (!feeDocs.length) {
//       console.log("No additional fees required.");
//       return;
//     }

//     const created = await this.FeeModel.insertMany(feeDocs, { ordered: true });
//     for (const doc of created) {
//       this.ids.fees.push(doc._id);
//     }

//     console.log(`Generated ${created.length} fees (total: ${this.ids.fees.length})`);
//   }

//   private async generateKycs(): Promise<void> {
//     console.log("Loading KYC records...");
//     if (!this.ids.renters.length) {
//       console.warn("Skipping KYC generation: renters are missing.");
//       return;
//     }

//     const existing = await this.KycsModel.find({}, { _id: 1, renter_id: 1 }).lean().exec();
//     const existingRenterIds = new Set(existing.map((kyc) => String(kyc.renter_id)));

//     for (const kyc of existing) {
//       this.ids.kycs.push(kyc._id);
//     }

//     const remainingSlots = Math.max(0, this.config.counts.kycs - existing.length);
//     if (!remainingSlots) {
//       console.log(`Loaded ${existing.length} KYC records (target reached).`);
//       return;
//     }

//     const renterPool = this.ids.renters.filter((id) => !existingRenterIds.has(String(id)));
//     if (!renterPool.length) {
//       console.warn("No renters without KYC records remain.");
//       return;
//     }

//     const kycDocs: Array<Partial<Kycs>> = [];
//     const kycCount = Math.min(remainingSlots, renterPool.length);

//     for (let i = 0; i < kycCount; i += 1) {
//       const renterId = renterPool[i];
//       const submittedAt = faker.date.recent({ days: 120 });
//       kycDocs.push({
//         renter_id: renterId,
//         type:
//           this.mode === "happy"
//             ? faker.helpers.arrayElement([KycType.DRIVER_LICENSE, KycType.NATIONAL_ID])
//             : faker.helpers.arrayElement(Object.values(KycType)),
//         document_number: `VN${faker.string.numeric({ length: 10 })}`,
//         expiry_date: faker.date.soon({
//           days: this.mode === "happy" ? faker.number.int({ min: 365 * 3, max: 365 * 6 }) : faker.number.int({ min: 365, max: 365 * 5 }),
//           refDate: submittedAt,
//         }),
//         status: this.mode === "happy" ? KycStatus.APPROVED : faker.helpers.arrayElement(Object.values(KycStatus)),
//         submitted_at: submittedAt,
//         verified_at:
//           this.mode === "happy"
//             ? faker.date.soon({ days: 7, refDate: submittedAt })
//             : this.bool(0.7)
//               ? faker.date.soon({ days: 20, refDate: submittedAt })
//               : undefined,
//       });
//     }

//     const created = await this.KycsModel.insertMany(kycDocs, { ordered: true });
//     for (const doc of created) {
//       this.ids.kycs.push(doc._id);
//     }

//     console.log(`Generated ${created.length} KYC records (total: ${this.ids.kycs.length})`);
//   }

//   private async generateInspections(): Promise<void> {
//     console.log("Loading inspections...");
//     if (!this.ids.rentals.length) {
//       console.warn("Skipping inspections: rentals are missing.");
//       return;
//     }

//     const existing = await this.InspectionModel.find(
//       {},
//       { _id: 1, rental_id: 1, type: 1, inspected_at: 1, current_battery_capacity_kwh: 1, current_mileage: 1 },
//     )
//       .lean()
//       .exec();

//     const inspectionsByRental = new Map<string, { pre: boolean; post: boolean }>();

//     for (const inspection of existing) {
//       this.ids.inspections.push(inspection._id);
//       this.inspectionMeta.set(String(inspection._id), {
//         rentalId: inspection.rental_id,
//         inspectedAt: inspection.inspected_at ?? faker.date.recent(),
//         type: inspection.type,
//       });

//       const rentalKey = String(inspection.rental_id);
//       const entry = inspectionsByRental.get(rentalKey) ?? { pre: false, post: false };
//       if (inspection.type === InspectionType.PRE_RENTAL) entry.pre = true;
//       if (inspection.type === InspectionType.POST_RENTAL) entry.post = true;
//       inspectionsByRental.set(rentalKey, entry);
//     }

//     const inspectionDocs: Array<Partial<Inspection>> = [];

//     for (const rentalId of this.ids.rentals) {
//       const rental = this.rentalMeta.get(String(rentalId));
//       if (!rental) continue;

//       const entry = inspectionsByRental.get(String(rentalId)) ?? { pre: false, post: false };
//       const metrics = this.getVehicleMetrics(rental.vehicleId);

//       if (!entry.pre) {
//         const inspectedAt = new Date(rental.pickup.getTime() - faker.number.int({ min: 15, max: 90 }) * 60_000);
//         inspectionDocs.push({
//           rental_id: rentalId,
//           type: InspectionType.PRE_RENTAL,
//           inspected_at: inspectedAt,
//           inspector_staff_id: this.randomStaffId(),
//           current_battery_capacity_kwh: metrics.battery,
//           current_mileage: metrics.mileage,
//         });

//         entry.pre = true;
//         inspectionsByRental.set(String(rentalId), entry);
//       }

//       if (rental.actualReturn && !entry.post) {
//         const mileageDelta = faker.number.int({ min: 30, max: 420 });
//         metrics.mileage += mileageDelta;
//         metrics.battery = Math.max(0, metrics.battery - faker.number.int({ min: 5, max: 30 }));
//         this.vehicleMetrics.set(String(rental.vehicleId), metrics);

//         const inspectedAt = new Date(rental.actualReturn.getTime() + faker.number.int({ min: 5, max: 60 }) * 60_000);
//         inspectionDocs.push({
//           rental_id: rentalId,
//           type: InspectionType.POST_RENTAL,
//           inspected_at: inspectedAt,
//           inspector_staff_id: this.randomStaffId(),
//           current_battery_capacity_kwh: metrics.battery,
//           current_mileage: metrics.mileage,
//         });

//         entry.post = true;
//         inspectionsByRental.set(String(rentalId), entry);
//       }
//     }

//     if (!inspectionDocs.length) {
//       console.log(`Loaded ${existing.length} inspections (no new inspections required).`);
//       return;
//     }

//     const created = await this.InspectionModel.insertMany(inspectionDocs, { ordered: true });
//     for (const doc of created) {
//       this.ids.inspections.push(doc._id);
//       this.inspectionMeta.set(String(doc._id), {
//         rentalId: doc.rental_id,
//         inspectedAt: doc.inspected_at,
//         type: doc.type,
//       });
//     }

//     console.log(`Generated ${created.length} inspections (total: ${this.ids.inspections.length})`);
//   }

//   private async generateReports(): Promise<void> {
//     console.log("Loading damage reports...");
//     if (this.mode === "happy") {
//       console.log("Happy-path mode active; skipping report generation.");
//       return;
//     }
//     const existing = await this.ReportModel.find({}, { _id: 1, inspection_id: 1 }).lean().exec();
//     for (const report of existing) {
//       this.ids.reports.push(report._id);
//       this.reportByInspection.set(String(report.inspection_id), report._id);
//     }

//     const reportDocs: Array<Partial<Report>> = [];
//     for (const [inspectionId, meta] of this.inspectionMeta.entries()) {
//       if (meta.type !== InspectionType.POST_RENTAL) continue;
//       if (this.reportByInspection.has(inspectionId)) continue;
//       if (!this.bool(0.55)) continue;

//       const rental = this.rentalMeta.get(String(meta.rentalId));
//       const booking = rental ? this.bookingMeta.get(String(rental.bookingId)) : undefined;

//       const damageFound = this.bool(0.35);
//       const damagePrice = damageFound ? this.money(120_000, 5_000_000) : 0;
//       const deposit = booking?.depositFee ?? 0;
//       const isOverDeposit = damageFound && damagePrice > deposit && this.bool(0.6);
//       const overDepositFee = isOverDeposit ? Math.max(50_000, damagePrice - deposit) : 0;

//       reportDocs.push({
//         inspection_id: new mongoose.Types.ObjectId(inspectionId),
//         damage_notes: damageFound ? faker.lorem.sentences(faker.number.int({ min: 1, max: 2 })) : undefined,
//         damage_found: damageFound,
//         damage_price: damagePrice,
//         is_over_deposit: isOverDeposit,
//         over_deposit_fee_amount: overDepositFee,
//       });
//     }

//     if (!reportDocs.length) {
//       console.log(`Loaded ${existing.length} reports (no new reports required).`);
//       return;
//     }

//     const created = await this.ReportModel.insertMany(reportDocs, { ordered: true });
//     for (const doc of created) {
//       this.ids.reports.push(doc._id);
//       this.reportByInspection.set(String(doc.inspection_id), doc._id);
//     }

//     console.log(`Generated ${created.length} reports (total: ${this.ids.reports.length})`);
//   }

//   private async generateReportsPhotos(): Promise<void> {
//     console.log("Loading report photos...");
//     if (this.mode === "happy") {
//       console.log("Happy-path mode active; skipping report photos.");
//       return;
//     }
//     const existing = await this.ReportsPhotoModel.find({}, { _id: 1, inspection_id: 1 }).lean().exec();
//     const existingCounts = new Map<string, number>();

//     for (const photo of existing) {
//       this.ids.reportsPhotos.push(photo._id);
//       const key = String(photo.inspection_id);
//       existingCounts.set(key, (existingCounts.get(key) ?? 0) + 1);
//     }

//     const photoDocs: Array<Partial<ReportsPhoto>> = [];
//     for (const inspectionId of this.ids.inspections) {
//       const currentCount = existingCounts.get(String(inspectionId)) ?? 0;
//       const desiredCount = this.bool(0.55) ? faker.number.int({ min: 1, max: 4 }) : 0;
//       const toCreate = Math.max(0, desiredCount - currentCount);
//       if (!toCreate) continue;

//       const reportId = this.reportByInspection.get(String(inspectionId));
//       for (let i = 0; i < toCreate; i += 1) {
//         photoDocs.push({
//           inspection_id: inspectionId,
//           report_id: reportId,
//           url: faker.image.url(),
//           label: this.bool(0.5) ? faker.lorem.words(faker.number.int({ min: 2, max: 4 })) : undefined,
//         });
//       }
//     }

//     if (!photoDocs.length) {
//       console.log(`Loaded ${existing.length} report photos (no new photos required).`);
//       return;
//     }

//     const created = await this.ReportsPhotoModel.insertMany(photoDocs, { ordered: true });
//     for (const doc of created) {
//       this.ids.reportsPhotos.push(doc._id);
//     }

//     console.log(`Generated ${created.length} report photos (total: ${this.ids.reportsPhotos.length})`);
//   }

//   private async generateContracts(): Promise<void> {
//     console.log("Loading contracts...");
//     const existing = await this.ContractModel.find({}, { _id: 1, rental_id: 1 }).lean().exec();
//     const rentalIdsWithContract = new Set(existing.map((contract) => String(contract.rental_id)));

//     for (const contract of existing) {
//       this.ids.contracts.push(contract._id);
//     }

//     const contractsDocs: Array<Partial<Contract>> = [];
//     for (const rentalId of this.ids.rentals) {
//       if (rentalIdsWithContract.has(String(rentalId))) continue;
//       const meta = this.rentalMeta.get(String(rentalId));
//       if (!meta) continue;

//       if (![RentalStatus.COMPLETED, RentalStatus.LATE].includes(meta.status)) continue;

//       contractsDocs.push({
//         rental_id: rentalId,
//         completed_at: meta.actualReturn ?? faker.date.recent({ days: 45 }),
//         document_url: faker.internet.url(),
//       });
//     }

//     if (!contractsDocs.length) {
//       console.log(`Loaded ${existing.length} contracts (no new contracts required).`);
//       return;
//     }

//     const created = await this.ContractModel.insertMany(contractsDocs, { ordered: true });
//     for (const doc of created) {
//       this.ids.contracts.push(doc._id);
//     }

//     console.log(`Generated ${created.length} contracts (total: ${this.ids.contracts.length})`);
//   }

//   private getUserIdsByRole(role: Role): ObjectId[] {
//     return this.ids.users.filter((id) => this.userRoleMap.get(String(id)) === role);
//   }

//   private findRentalMetaByBookingId(bookingId: ObjectId): RentalMeta | undefined {
//     for (const meta of this.rentalMeta.values()) {
//       if (String(meta.bookingId) === String(bookingId)) {
//         return meta;
//       }
//     }
//     return undefined;
//   }

//   private resolveBookingStatus(verificationStatus: BookingVerificationStatus): BookingStatus {
//     if (this.mode === "happy") {
//       return BookingStatus.VERIFIED;
//     }
//     if (verificationStatus === BookingVerificationStatus.APPROVED) {
//       return BookingStatus.VERIFIED;
//     }
//     if (verificationStatus === BookingVerificationStatus.PENDING) {
//       return this.bool(0.25) ? BookingStatus.CANCELLED : BookingStatus.PENDING_VERIFICATION;
//     }
//     return BookingStatus.CANCELLED;
//   }

//   private randomBookingVerificationStatus(): BookingVerificationStatus {
//     if (this.mode === "happy") {
//       return BookingVerificationStatus.APPROVED;
//     }
//     const weighted: BookingVerificationStatus[] = [
//       BookingVerificationStatus.APPROVED,
//       BookingVerificationStatus.APPROVED,
//       BookingVerificationStatus.PENDING,
//       BookingVerificationStatus.REJECTED_OTHER,
//       BookingVerificationStatus.REJECTED_MISMATCH,
//     ];
//     return faker.helpers.arrayElement(weighted);
//   }

//   private randomRentalStatus(): RentalStatus {
//     if (this.mode === "happy") {
//       return RentalStatus.COMPLETED;
//     }
//     const weighted: RentalStatus[] = [
//       RentalStatus.RESERVED,
//       RentalStatus.RESERVED,
//       RentalStatus.IN_PROGRESS,
//       RentalStatus.COMPLETED,
//       RentalStatus.COMPLETED,
//       RentalStatus.LATE,
//       RentalStatus.CANCELLED,
//     ];
//     return faker.helpers.arrayElement(weighted);
//   }

//   private resolvePaymentStatus(bookingMeta: BookingMeta | undefined, hasRental: boolean): PaymentStatus {
//     if (this.mode === "happy") {
//       return PaymentStatus.PAID;
//     }
//     if (!bookingMeta) {
//       return faker.helpers.arrayElement(Object.values(PaymentStatus));
//     }

//     if (bookingMeta.status === BookingStatus.CANCELLED) {
//       return faker.helpers.arrayElement([PaymentStatus.REFUNDED, PaymentStatus.FAILED, PaymentStatus.PENDING]);
//     }

//     if (hasRental) {
//       return faker.helpers.arrayElement([PaymentStatus.PAID, PaymentStatus.PAID, PaymentStatus.PENDING]);
//     }

//     return faker.helpers.arrayElement([PaymentStatus.PENDING, PaymentStatus.PAID, PaymentStatus.FAILED]);
//   }

//   private requireStationId(): ObjectId {
//     if (!this.ids.stations.length) {
//       throw new Error("At least one station is required before generating staff.");
//     }
//     return faker.helpers.arrayElement(this.ids.stations);
//   }

//   private randomStaffId(): ObjectId | undefined {
//     if (!this.ids.staff.length) {
//       return undefined;
//     }
//     return faker.helpers.arrayElement(this.ids.staff);
//   }

//   private generateLicensePlate(): string {
//     for (let attempt = 0; attempt < 1_000; attempt += 1) {
//       const letters = faker.string.alpha({ length: 2, casing: "upper" });
//       const numbers = faker.string.numeric({ length: 4 });
//       const plate = `EV${letters}-${numbers}`;
//       if (!this.vehicleLicensePlates.has(plate)) {
//         this.vehicleLicensePlates.add(plate);
//         return plate;
//       }
//     }

//     throw new Error("Failed to generate unique vehicle license plate");
//   }

//   private randomVehicleStatus(): VehicleStatus {
//     if (this.mode === "happy") {
//       return faker.helpers.arrayElement([VehicleStatus.AVAILABLE, VehicleStatus.BOOKED]);
//     }
//     const weighted: VehicleStatus[] = [
//       VehicleStatus.AVAILABLE,
//       VehicleStatus.AVAILABLE,
//       VehicleStatus.BOOKED,
//       VehicleStatus.MAINTAIN,
//       VehicleStatus.PENDING,
//     ];
//     return faker.helpers.arrayElement(weighted);
//   }

//   private getVehicleMetrics(vehicleId: ObjectId): VehicleMetrics {
//     const key = String(vehicleId);
//     let metrics = this.vehicleMetrics.get(key);
//     if (!metrics) {
//       metrics = {
//         battery: faker.number.int({ min: 45, max: 100 }),
//         mileage: faker.number.int({ min: 5_000, max: 50_000 }),
//       };
//       this.vehicleMetrics.set(key, metrics);
//     }
//     return metrics;
//   }

//   private hashPassword(password: string): string {
//     return password;
//   }

//   private money(min: number, max: number, step = 1_000): number {
//     if (max < min) {
//       [min, max] = [max, min];
//     }

//     const scaledMin = Math.ceil(min / step);
//     const scaledMax = Math.floor(max / step);
//     if (scaledMax < scaledMin) {
//       return scaledMin * step;
//     }

//     return faker.number.int({ min: scaledMin, max: scaledMax }) * step;
//   }

//   private bool(probability: number): boolean {
//     return faker.number.float({ min: 0, max: 1 }) < probability;
//   }

//   private randomVietnamPhone(): string {
//     return `+84${faker.string.numeric({ length: 9 })}`;
//   }

//   private normalizeCount(value: number | undefined, fallback: number): number {
//     if (typeof value !== "number" || Number.isNaN(value) || value < 0) {
//       return fallback;
//     }
//     return Math.floor(value);
//   }

//   private resetCaches(): void {
//     (Object.keys(this.ids) as Array<keyof MockDataIds>).forEach((key) => {
//       this.ids[key].length = 0;
//     });
//     this.userRoleMap.clear();
//     this.bookingMeta.clear();
//     this.rentalMeta.clear();
//     this.inspectionMeta.clear();
//     this.reportByInspection.clear();
//     this.vehicleMetrics.clear();
//     this.vehicleLicensePlates.clear();
//   }
// }

// async function main(): Promise<void> {
//   const args = process.argv.slice(2);
//   const seedArg = args.find((arg) => arg.startsWith("--seed="));
//   const drop = args.includes("--drop");
//   const modeArg = args.find((arg) => arg.startsWith("--mode="));

//   const countFlags: Array<[string, keyof DefaultCounts]> = [
//     ["--stations=", "stations"],
//     ["--vehicles=", "vehicles"],
//     ["--bookings=", "bookings"],
//     ["--kycs=", "kycs"],
//   ];

//   const countsOverrides: Partial<Record<keyof DefaultCounts, number>> = {};
//   for (const arg of args) {
//     for (const [flag, key] of countFlags) {
//       if (arg.startsWith(flag)) {
//         const value = Number(arg.slice(flag.length));
//         if (Number.isNaN(value)) {
//           console.warn(`Ignoring invalid numeric argument "${arg}"`);
//         } else {
//           countsOverrides[key] = value;
//         }
//       }
//     }
//   }

//   const togglesOverrides: Partial<Record<ToggleKey, boolean>> = {};
//   if (args.includes("--skip-kyc") || args.includes("--skip-kycs")) {
//     togglesOverrides.kycs = false;
//   }
//   if (args.includes("--skip-inspections")) {
//     togglesOverrides.inspections = false;
//   }
//   if (args.includes("--skip-reports")) {
//     togglesOverrides.reports = false;
//   }
//   if (args.includes("--skip-report-photos")) {
//     togglesOverrides.reportPhotos = false;
//   }
//   if (args.includes("--skip-contracts")) {
//     togglesOverrides.contracts = false;
//   }

//   const seed = seedArg ? Number(seedArg.split("=")[1]) : undefined;
//   if (seedArg && Number.isNaN(seed)) {
//     throw new Error(`Invalid seed provided: ${seedArg}`);
//   }

//   let mode: MockDataMode | undefined;
//   if (modeArg) {
//     const modeValue = modeArg.split("=")[1]?.toLowerCase();
//     if (modeValue === "happy" || modeValue === "mixed") {
//       mode = modeValue as MockDataMode;
//     } else {
//       console.warn(`Unknown mode "${modeValue}". Falling back to "happy".`);
//       mode = "happy";
//     }
//   }

//   const generator = new MockDataGenerator(seed, {
//     counts: countsOverrides,
//     toggles: togglesOverrides,
//     mode,
//   });

//   try {
//     await generator.connect();
//     await generator.generateAllData({ clearExisting: drop });
//     console.log("All mock data generated successfully!");
//   } catch (error) {
//     console.error("Error generating mock data:", error);
//     process.exit(1);
//   } finally {
//     await generator.disconnect();
//   }
// }

// if (require.main === module) {
//   main().catch((error) => {
//     console.error("Error running mock data generator:", error);
//     process.exit(1);
//   });
// }

// export { MockDataGenerator };
// export type { MockGeneratorOptions, MockDataMode };
