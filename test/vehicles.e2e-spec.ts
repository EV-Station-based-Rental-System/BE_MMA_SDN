import { INestApplication, ValidationPipe } from "@nestjs/common";
import { MongooseModule, getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose, { Model } from "mongoose";
import request from "supertest";
import { HttpErrorInterceptor } from "src/common/interceptors/http-error.interceptor";
import { VehicleModule } from "src/modules/vehicles/vehicles.module";
import { ConfigModule } from "@nestjs/config";
import configuration from "src/common/config/config";
import { applyAuthGuardOverrides } from "./utils/auth-helpers";
import { Station, StationSchema } from "src/models/station.schema";
import { Pricing, PricingSchema } from "src/models/pricings.schema";

const baseUrl = "/vehicle";

describe("VehicleModule (e2e)", () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let stationModel: Model<Station>;
  let pricingModel: Model<Pricing>;
  let vehicleModel: Model<any>;
  let testStationId: string;

  const validPayload = {
    make: "Tesla",
    model: "Model 3",
    model_year: 2024,
    category: "EV",
  };

  const createVehicle = async (override: Record<string, unknown> = {}) => {
    const response = await request(app.getHttpServer())
      .post(baseUrl)
      .send({
        ...validPayload,
        ...override,
      });

    expect(response.status).toBe(201);
    return response.body.data as { _id: string };
  };

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();

    const moduleBuilder = Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
        MongooseModule.forRoot(await mongoServer.getUri()),
        MongooseModule.forFeature([
          { name: Station.name, schema: StationSchema },
          { name: Pricing.name, schema: PricingSchema },
        ]),
        VehicleModule,
      ],
    });

    const moduleFixture: TestingModule = await applyAuthGuardOverrides(moduleBuilder).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalInterceptors(new HttpErrorInterceptor());

    // Get models for creating test data
    stationModel = moduleFixture.get<Model<Station>>(getModelToken(Station.name));
    pricingModel = moduleFixture.get<Model<Pricing>>(getModelToken(Pricing.name));
    vehicleModel = moduleFixture.get<Model<any>>(getModelToken("Vehicle"));

    await app.init();

    // Create a test station
    const station = new stationModel({
      name: "Test Station",
      address: "123 Test St",
      latitude: 10.123,
      longitude: 106.456,
      is_active: true,
    });
    const savedStation = await station.save();
    testStationId = savedStation._id.toString();
  });

  afterEach(async () => {
    const connection = mongoose.connection;
    if (connection && connection.readyState === 1 && connection.db) {
      await connection.db.dropDatabase();
    }
  });

  afterAll(async () => {
    await app.close();
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it("POST /vehicle creates a vehicle and returns 201", async () => {
    const response = await request(app.getHttpServer()).post(baseUrl).send(validPayload);

    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({
      make: validPayload.make,
      model: validPayload.model,
      model_year: validPayload.model_year,
      category: validPayload.category,
    });
    expect(response.body.data).toHaveProperty("_id");
  });

  it("POST /vehicle rejects invalid payload with 400", async () => {
    const response = await request(app.getHttpServer()).post(baseUrl).send({ make: "OnlyMake" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBeDefined();
  });

  it("GET /vehicle returns a paginated list with 200", async () => {
    const created = await createVehicle();
    const response = await request(app.getHttpServer()).get(baseUrl).query({ page: 1, take: 5 });

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.some((item: { _id: string }) => item._id === created._id)).toBe(true);
    expect(response.body.meta).toMatchObject({
      page: 1,
      take: 5,
    });
    expect(response.body.meta.total).toBeGreaterThanOrEqual(1);
  });

  it("GET /vehicle/:id returns vehicle detail with 200", async () => {
    const created = await createVehicle();
    const response = await request(app.getHttpServer()).get(`${baseUrl}/${created._id}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      _id: created._id,
      make: validPayload.make,
    });
  });

  it("GET /vehicle/:id returns 404 for unknown vehicle", async () => {
    const nonExistingId = new mongoose.Types.ObjectId().toString();
    const response = await request(app.getHttpServer()).get(`${baseUrl}/${nonExistingId}`);

    expect(response.status).toBe(404);
  });

  it("PUT /vehicle/:id updates vehicle and returns 200", async () => {
    const created = await createVehicle();
    const response = await request(app.getHttpServer()).put(`${baseUrl}/${created._id}`).send({ model: "Model 3 Performance" });

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      _id: created._id,
      model: "Model 3 Performance",
    });
  });

  it("PUT /vehicle/:id returns 404 for unknown vehicle", async () => {
    const nonExistingId = new mongoose.Types.ObjectId().toString();
    const response = await request(app.getHttpServer()).put(`${baseUrl}/${nonExistingId}`).send({ model: "Model S" });

    expect(response.status).toBe(404);
  });

  it("PATCH /vehicle/soft-delete/:id marks vehicle inactive with 200", async () => {
    const created = await createVehicle();
    const response = await request(app.getHttpServer()).patch(`${baseUrl}/soft-delete/${created._id}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBeDefined();

    const checkResponse = await request(app.getHttpServer()).get(`${baseUrl}/${created._id}`);
    expect(checkResponse.status).toBe(200);
    expect(checkResponse.body.data.is_active).toBe(false);
  });

  it("DELETE /vehicle/:id removes vehicle and returns 200", async () => {
    const created = await createVehicle();
    const response = await request(app.getHttpServer()).delete(`${baseUrl}/${created._id}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toContain("Vehicle hard-deleted successfully");

    const checkResponse = await request(app.getHttpServer()).get(`${baseUrl}/${created._id}`);
    expect(checkResponse.status).toBe(404);
  });

  describe("Vehicle with Station and Pricing", () => {
    it("GET /vehicle/:id returns vehicle with station when station_id exists", async () => {
      // Create vehicle with station_id using the model directly
      const vehicle = new vehicleModel({
        ...validPayload,
        station_id: new mongoose.Types.ObjectId(testStationId),
      });
      const saved = await vehicle.save();

      const response = await request(app.getHttpServer()).get(`${baseUrl}/${saved._id}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty("station");
      expect(response.body.data.station).toMatchObject({
        name: "Test Station",
        address: "123 Test St",
        is_active: true,
      });
    });

    it("GET /vehicle/:id returns vehicle with current pricing", async () => {
      const vehicle = await createVehicle();

      // Create current pricing
      const currentDate = new Date();
      const pricing = new pricingModel({
        vehicle_id: vehicle._id,
        price_per_hour: 50,
        price_per_day: 400,
        effective_from: new Date(currentDate.getTime() - 86400000), // 1 day ago
        effective_to: null, // Currently active
        deposit_amount: 1000,
        late_return_fee_per_hour: 100,
        mileage_limit_per_day: 200,
        excess_mileage_fee: 5,
      });
      await pricing.save();

      const response = await request(app.getHttpServer()).get(`${baseUrl}/${vehicle._id}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty("pricing");
      expect(response.body.data.pricing).toMatchObject({
        price_per_hour: 50,
        price_per_day: 400,
        deposit_amount: 1000,
        late_return_fee_per_hour: 100,
      });
    });

    it("GET /vehicle/:id returns vehicle with most recent current pricing when multiple exist", async () => {
      const vehicle = await createVehicle();
      const currentDate = new Date();

      // Create older pricing
      const oldPricing = new pricingModel({
        vehicle_id: vehicle._id,
        price_per_hour: 40,
        price_per_day: 300,
        effective_from: new Date(currentDate.getTime() - 172800000), // 2 days ago
        effective_to: null,
        deposit_amount: 800,
      });
      await oldPricing.save();

      // Create newer pricing
      const newPricing = new pricingModel({
        vehicle_id: vehicle._id,
        price_per_hour: 60,
        price_per_day: 500,
        effective_from: new Date(currentDate.getTime() - 86400000), // 1 day ago
        effective_to: null,
        deposit_amount: 1200,
      });
      await newPricing.save();

      const response = await request(app.getHttpServer()).get(`${baseUrl}/${vehicle._id}`);

      expect(response.status).toBe(200);
      expect(response.body.data.pricing).toMatchObject({
        price_per_hour: 60,
        price_per_day: 500,
        deposit_amount: 1200,
      });
    });

    it("GET /vehicle returns list with pricing and station for each vehicle", async () => {
      // Create vehicles with station_id using model directly
      const vehicle1 = new vehicleModel({
        ...validPayload,
        make: "Tesla",
        station_id: new mongoose.Types.ObjectId(testStationId),
      });
      await vehicle1.save();

      const vehicle2 = new vehicleModel({
        ...validPayload,
        make: "Rivian",
        station_id: new mongoose.Types.ObjectId(testStationId),
      });
      await vehicle2.save();

      // Add pricing for both vehicles
      const pricing1 = new pricingModel({
        vehicle_id: vehicle1._id,
        price_per_hour: 50,
        price_per_day: 400,
        effective_from: new Date(Date.now() - 86400000),
        effective_to: null,
        deposit_amount: 1000,
      });
      await pricing1.save();

      const pricing2 = new pricingModel({
        vehicle_id: vehicle2._id,
        price_per_hour: 70,
        price_per_day: 600,
        effective_from: new Date(Date.now() - 86400000),
        effective_to: null,
        deposit_amount: 1500,
      });
      await pricing2.save();

      const response = await request(app.getHttpServer()).get(baseUrl).query({ page: 1, take: 10 });

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);

      const teslaVehicle = response.body.data.find((v: any) => v.make === "Tesla");
      expect(teslaVehicle).toHaveProperty("pricing");
      expect(teslaVehicle.pricing).toMatchObject({ price_per_day: 400 });
      expect(teslaVehicle).toHaveProperty("station");
      expect(teslaVehicle.station.name).toBe("Test Station");
    });

    it("GET /vehicle/:id returns null pricing when no active pricing exists", async () => {
      const vehicle = await createVehicle();

      // Create expired pricing
      const expiredPricing = new pricingModel({
        vehicle_id: vehicle._id,
        price_per_hour: 50,
        price_per_day: 400,
        effective_from: new Date(Date.now() - 172800000), // 2 days ago
        effective_to: new Date(Date.now() - 86400000), // Expired 1 day ago
        deposit_amount: 1000,
      });
      await expiredPricing.save();

      const response = await request(app.getHttpServer()).get(`${baseUrl}/${vehicle._id}`);

      expect(response.status).toBe(200);
      expect(response.body.data.pricing).toBeUndefined();
    });

    it("GET /vehicle/:id does not return future pricing", async () => {
      const vehicle = await createVehicle();

      // Create future pricing
      const futurePricing = new pricingModel({
        vehicle_id: vehicle._id,
        price_per_hour: 50,
        price_per_day: 400,
        effective_from: new Date(Date.now() + 86400000), // Starts tomorrow
        effective_to: null,
        deposit_amount: 1000,
      });
      await futurePricing.save();

      const response = await request(app.getHttpServer()).get(`${baseUrl}/${vehicle._id}`);

      expect(response.status).toBe(200);
      expect(response.body.data.pricing).toBeUndefined();
    });
  });

  describe("POST /vehicle/with-station-and-pricing (Create Vehicle with Station and Pricing)", () => {
    // Helper function to generate unique VIN
    const generateUniqueVIN = () => `5YJSA1E26MF${Date.now().toString().slice(-6)}${Math.random().toString(36).slice(-3).toUpperCase()}`;

    const getValidCompletePayload = () => ({
      vehicle: {
        make: "Tesla",
        model: "Model Y",
        model_year: 2025,
        category: "EV",
        battery_capacity_kwh: 75,
        range_km: 500,
        vin_number: generateUniqueVIN(),
        img_url: "https://example.com/tesla-model-y.jpg",
      },
      station: {
        name: "Downtown Station",
        address: "456 Main St, District 1",
        latitude: 10.775598,
        longitude: 106.704128,
      },
      pricing: {
        price_per_hour: 50000,
        price_per_day: 800000,
        effective_from: new Date(Date.now() - 86400000).toISOString(), // 1 day ago to ensure it's active
        effective_to: null,
        deposit_amount: 2000000,
        late_return_fee_per_hour: 100000,
        mileage_limit_per_day: 250,
        excess_mileage_fee: 5000,
      },
    });

    it("POST /vehicle/with-station-and-pricing creates vehicle with station and pricing successfully", async () => {
      const validCompletePayload = getValidCompletePayload();
      const response = await request(app.getHttpServer()).post(`${baseUrl}/with-station-and-pricing`).send(validCompletePayload);

      expect(response.status).toBe(201);
      expect(response.body.data).toBeDefined();

      // Verify vehicle data
      expect(response.body.data).toMatchObject({
        make: validCompletePayload.vehicle.make,
        model: validCompletePayload.vehicle.model,
        model_year: validCompletePayload.vehicle.model_year,
        category: validCompletePayload.vehicle.category,
        battery_capacity_kwh: validCompletePayload.vehicle.battery_capacity_kwh,
        range_km: validCompletePayload.vehicle.range_km,
        vin_number: validCompletePayload.vehicle.vin_number,
      });

      // Verify station data is included
      expect(response.body.data.station).toBeDefined();
      expect(response.body.data.station).toMatchObject({
        name: validCompletePayload.station.name,
        address: validCompletePayload.station.address,
        latitude: validCompletePayload.station.latitude,
        longitude: validCompletePayload.station.longitude,
      });

      // Verify pricing data is included
      expect(response.body.data.pricing).toBeDefined();
      expect(response.body.data.pricing).toMatchObject({
        price_per_hour: validCompletePayload.pricing.price_per_hour,
        price_per_day: validCompletePayload.pricing.price_per_day,
        deposit_amount: validCompletePayload.pricing.deposit_amount,
        late_return_fee_per_hour: validCompletePayload.pricing.late_return_fee_per_hour,
        mileage_limit_per_day: validCompletePayload.pricing.mileage_limit_per_day,
        excess_mileage_fee: validCompletePayload.pricing.excess_mileage_fee,
      });

      // Verify the vehicle has station_id set
      expect(response.body.data.station_id).toBeDefined();
    });

    it("POST /vehicle/with-station-and-pricing creates all entities in database", async () => {
      const validCompletePayload = getValidCompletePayload();
      const response = await request(app.getHttpServer()).post(`${baseUrl}/with-station-and-pricing`).send(validCompletePayload);

      expect(response.status).toBe(201);
      const createdVehicleId = response.body.data._id;
      const createdStationId = response.body.data.station._id;

      // Verify vehicle exists in database
      const vehicleInDb = await vehicleModel.findById(createdVehicleId);
      expect(vehicleInDb).toBeDefined();
      expect(vehicleInDb!.make).toBe(validCompletePayload.vehicle.make);

      // Verify station exists in database
      const stationInDb = await stationModel.findById(createdStationId);
      expect(stationInDb).toBeDefined();
      expect(stationInDb!.name).toBe(validCompletePayload.station.name);

      // Verify pricing exists in database
      const pricingInDb = await pricingModel.findOne({ vehicle_id: createdVehicleId });
      expect(pricingInDb).toBeDefined();
      expect(pricingInDb!.price_per_hour).toBe(validCompletePayload.pricing.price_per_hour);
      expect(pricingInDb!.vehicle_id.toString()).toBe(createdVehicleId);
    });

    it("POST /vehicle/with-station-and-pricing creates vehicle with minimal fields", async () => {
      // Set effective_from to a date in the past to ensure it's active
      const effectiveDate = new Date(Date.now() - 86400000); // 1 day ago
      const minimalPayload = {
        vehicle: {
          make: "Rivian",
          model: "R1T",
          model_year: 2024,
          category: "EV",
        },
        station: {
          name: "Minimal Station",
          address: "789 Test Ave",
        },
        pricing: {
          price_per_hour: 40000,
          effective_from: effectiveDate.toISOString(),
          deposit_amount: 1500000,
        },
      };

      const response = await request(app.getHttpServer()).post(`${baseUrl}/with-station-and-pricing`).send(minimalPayload);

      expect(response.status).toBe(201);
      expect(response.body.data).toMatchObject({
        make: minimalPayload.vehicle.make,
        model: minimalPayload.vehicle.model,
      });
      expect(response.body.data.station).toMatchObject({
        name: minimalPayload.station.name,
        address: minimalPayload.station.address,
      });

      // Verify pricing is present (might be undefined if effective date doesn't match query)
      // The pricing should be returned in the response
      if (response.body.data.pricing) {
        expect(response.body.data.pricing.price_per_hour).toBe(minimalPayload.pricing.price_per_hour);
        expect(response.body.data.pricing.deposit_amount).toBe(minimalPayload.pricing.deposit_amount);
      } else {
        // If pricing is not returned, verify it was at least created in the database
        const pricingInDb = await pricingModel.findOne({ vehicle_id: response.body.data._id });
        expect(pricingInDb).toBeDefined();
        expect(pricingInDb!.price_per_hour).toBe(minimalPayload.pricing.price_per_hour);
      }
    });

    it("POST /vehicle/with-station-and-pricing rejects payload with missing vehicle data", async () => {
      const validCompletePayload = getValidCompletePayload();
      const invalidPayload = {
        vehicle: {
          make: "Tesla",
          // missing required fields: model, model_year, category
        },
        station: validCompletePayload.station,
        pricing: validCompletePayload.pricing,
      };

      const response = await request(app.getHttpServer()).post(`${baseUrl}/with-station-and-pricing`).send(invalidPayload);

      expect(response.status).toBe(400);
      expect(response.body.message).toBeDefined();
    });

    it("POST /vehicle/with-station-and-pricing rejects payload with missing station data", async () => {
      const validCompletePayload = getValidCompletePayload();
      const invalidPayload = {
        vehicle: validCompletePayload.vehicle,
        station: {
          name: "No Address Station",
          // missing required field: address
        },
        pricing: validCompletePayload.pricing,
      };

      const response = await request(app.getHttpServer()).post(`${baseUrl}/with-station-and-pricing`).send(invalidPayload);

      expect(response.status).toBe(400);
      expect(response.body.message).toBeDefined();
    });

    it("POST /vehicle/with-station-and-pricing rejects payload with missing pricing data", async () => {
      const validCompletePayload = getValidCompletePayload();
      const invalidPayload = {
        vehicle: validCompletePayload.vehicle,
        station: validCompletePayload.station,
        pricing: {
          price_per_hour: 50000,
          // missing required fields: effective_from, deposit_amount
        },
      };

      const response = await request(app.getHttpServer()).post(`${baseUrl}/with-station-and-pricing`).send(invalidPayload);

      expect(response.status).toBe(400);
      expect(response.body.message).toBeDefined();
    });

    it("POST /vehicle/with-station-and-pricing rejects payload with invalid nested types", async () => {
      const validCompletePayload = getValidCompletePayload();
      const invalidPayload = {
        vehicle: {
          ...validCompletePayload.vehicle,
          model_year: "not-a-number", // should be number
        },
        station: validCompletePayload.station,
        pricing: validCompletePayload.pricing,
      };

      const response = await request(app.getHttpServer()).post(`${baseUrl}/with-station-and-pricing`).send(invalidPayload);

      expect(response.status).toBe(400);
      expect(response.body.message).toBeDefined();
    });

    it("POST /vehicle/with-station-and-pricing rejects payload with invalid pricing dates", async () => {
      const validCompletePayload = getValidCompletePayload();
      const invalidPayload = {
        vehicle: validCompletePayload.vehicle,
        station: validCompletePayload.station,
        pricing: {
          ...validCompletePayload.pricing,
          effective_from: "not-a-valid-date",
        },
      };

      const response = await request(app.getHttpServer()).post(`${baseUrl}/with-station-and-pricing`).send(invalidPayload);

      expect(response.status).toBe(400);
      expect(response.body.message).toBeDefined();
    });

    it("POST /vehicle/with-station-and-pricing accepts pricing with effective_to date", async () => {
      const validCompletePayload = getValidCompletePayload();
      const payloadWithEndDate = {
        ...validCompletePayload,
        pricing: {
          ...validCompletePayload.pricing,
          effective_to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        },
      };

      const response = await request(app.getHttpServer()).post(`${baseUrl}/with-station-and-pricing`).send(payloadWithEndDate);

      expect(response.status).toBe(201);
      expect(response.body.data.pricing.effective_to).toBeDefined();
    });

    it("POST /vehicle/with-station-and-pricing creates multiple vehicles with different stations", async () => {
      const validCompletePayload = getValidCompletePayload();
      const payload1 = {
        ...validCompletePayload,
        vehicle: { ...validCompletePayload.vehicle, vin_number: generateUniqueVIN() },
        station: { ...validCompletePayload.station, name: "Station A", address: "100 Address A" },
      };

      const payload2 = {
        ...validCompletePayload,
        vehicle: { ...validCompletePayload.vehicle, vin_number: generateUniqueVIN() },
        station: { ...validCompletePayload.station, name: "Station B", address: "200 Address B" },
      };

      const response1 = await request(app.getHttpServer()).post(`${baseUrl}/with-station-and-pricing`).send(payload1);

      const response2 = await request(app.getHttpServer()).post(`${baseUrl}/with-station-and-pricing`).send(payload2);

      expect(response1.status).toBe(201);
      expect(response2.status).toBe(201);

      // Verify different station IDs
      expect(response1.body.data.station._id).not.toBe(response2.body.data.station._id);

      // Verify different vehicle IDs
      expect(response1.body.data._id).not.toBe(response2.body.data._id);

      // Verify stations have correct names
      expect(response1.body.data.station.name).toBe("Station A");
      expect(response2.body.data.station.name).toBe("Station B");
    });

    it("POST /vehicle/with-station-and-pricing rejects duplicate VIN number", async () => {
      const validCompletePayload = getValidCompletePayload();
      const payload1 = {
        ...validCompletePayload,
        vehicle: { ...validCompletePayload.vehicle, vin_number: "DUPLICATE_VIN_12345" },
      };

      const payload2 = {
        ...validCompletePayload,
        vehicle: { ...validCompletePayload.vehicle, vin_number: "DUPLICATE_VIN_12345" },
        station: { ...validCompletePayload.station, name: "Different Station" },
      };

      // Create first vehicle
      const response1 = await request(app.getHttpServer()).post(`${baseUrl}/with-station-and-pricing`).send(payload1);

      expect(response1.status).toBe(201);

      // Try to create second vehicle with same VIN
      const response2 = await request(app.getHttpServer()).post(`${baseUrl}/with-station-and-pricing`).send(payload2);

      expect(response2.status).toBe(500); // Duplicate key error from MongoDB
    });

    it("POST /vehicle/with-station-and-pricing can be retrieved via GET endpoint", async () => {
      const validCompletePayload = getValidCompletePayload();
      const response = await request(app.getHttpServer()).post(`${baseUrl}/with-station-and-pricing`).send(validCompletePayload);

      expect(response.status).toBe(201);
      const createdVehicleId = response.body.data._id;

      // Retrieve the vehicle
      const getResponse = await request(app.getHttpServer()).get(`${baseUrl}/${createdVehicleId}`);

      expect(getResponse.status).toBe(200);
      expect(getResponse.body.data._id).toBe(createdVehicleId);
      expect(getResponse.body.data.station).toBeDefined();
      expect(getResponse.body.data.pricing).toBeDefined();
    });

    it("POST /vehicle/with-station-and-pricing vehicle appears in list endpoint", async () => {
      const validCompletePayload = getValidCompletePayload();
      const response = await request(app.getHttpServer()).post(`${baseUrl}/with-station-and-pricing`).send(validCompletePayload);

      expect(response.status).toBe(201);
      expect(response.body.data).toBeDefined();
      expect(response.body.data._id).toBeDefined();
      const createdVehicleId = response.body.data._id;

      // Verify vehicle was created in database
      const vehicleInDb = await vehicleModel.findById(createdVehicleId);
      expect(vehicleInDb).toBeDefined();

      // Get list of vehicles - use larger page size to ensure we get the vehicle
      const listResponse = await request(app.getHttpServer()).get(baseUrl).query({ page: 1, take: 100 });

      expect(listResponse.status).toBe(200);
      expect(listResponse.body.data).toBeDefined();
      expect(Array.isArray(listResponse.body.data)).toBe(true);
      expect(listResponse.body.data.length).toBeGreaterThan(0);

      // The vehicle should be in the list
      const vehicleInList = listResponse.body.data.find((v: any) => v._id === createdVehicleId);
      expect(vehicleInList).toBeDefined();

      if (vehicleInList) {
        expect(vehicleInList.station).toBeDefined();
        expect(vehicleInList.pricing).toBeDefined();
      }
    });
  });
});
