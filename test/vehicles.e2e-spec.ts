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
});
