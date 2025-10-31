import { INestApplication, ValidationPipe } from "@nestjs/common";
import { MongooseModule, getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose, { Model } from "mongoose";
import request from "supertest";
import { HttpErrorInterceptor } from "src/common/interceptors/http-error.interceptor";
import { PricingModule } from "src/modules/pricings/pricing.module";
import { ConfigModule } from "@nestjs/config";
import configuration from "src/common/config/config";
import { applyAuthGuardOverrides } from "./utils/auth-helpers";
import { Vehicle } from "src/models/vehicle.schema";
import { Pricing } from "src/models/pricings.schema";

const baseUrl = "/pricings";

describe("PricingModule (e2e)", () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let vehicleModel: Model<Vehicle>;
  let pricingModel: Model<Pricing>;
  let testVehicleId: string;

  const createVehicle = async () => {
    const vehicle = new vehicleModel({
      make: "Tesla",
      model: "Model 3",
      model_year: 2024,
      category: "EV",
      is_active: true,
    });
    const saved = await vehicle.save();
    return saved._id.toString();
  };

  const createPricing = async (override: Partial<Pricing> = {}) => {
    const response = await request(app.getHttpServer())
      .post(baseUrl)
      .send({
        vehicle_id: testVehicleId,
        price_per_hour: 50,
        price_per_day: 400,
        effective_from: new Date(),
        deposit_amount: 1000,
        late_return_fee_per_hour: 100,
        mileage_limit_per_day: 200,
        excess_mileage_fee: 5,
        ...override,
      });

    expect(response.status).toBe(201);
    return response.body.data as Pricing & { _id: string };
  };

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();

    const moduleBuilder = Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true, load: [configuration] }), MongooseModule.forRoot(await mongoServer.getUri()), PricingModule],
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

    await app.init();

    vehicleModel = moduleFixture.get<Model<Vehicle>>(getModelToken(Vehicle.name));
    pricingModel = moduleFixture.get<Model<Pricing>>(getModelToken(Pricing.name));
    testVehicleId = await createVehicle();
  });

  afterEach(async () => {
    const connection = mongoose.connection;
    if (connection && connection.readyState === 1 && connection.db) {
      // Clear all collections
      await connection.db.dropDatabase();
      // Recreate test vehicle
      testVehicleId = await createVehicle();
    }
  });

  afterAll(async () => {
    await app.close();
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe("POST /pricings", () => {
    it("creates a pricing and returns 201", async () => {
      const pricingData = {
        vehicle_id: testVehicleId,
        price_per_hour: 50,
        price_per_day: 400,
        effective_from: new Date().toISOString(),
        deposit_amount: 1000,
        late_return_fee_per_hour: 100,
        mileage_limit_per_day: 200,
        excess_mileage_fee: 5,
      };

      const response = await request(app.getHttpServer()).post(baseUrl).send(pricingData);

      expect(response.status).toBe(201);
      expect(response.body.data).toMatchObject({
        price_per_hour: 50,
        price_per_day: 400,
        deposit_amount: 1000,
      });
      expect(response.body.data).toHaveProperty("_id");
    });

    it("rejects pricing for non-existent vehicle with 404", async () => {
      const nonExistingVehicleId = new mongoose.Types.ObjectId().toString();
      const pricingData = {
        vehicle_id: nonExistingVehicleId,
        price_per_hour: 50,
        price_per_day: 400,
        effective_from: new Date().toISOString(),
        deposit_amount: 1000,
      };

      const response = await request(app.getHttpServer()).post(baseUrl).send(pricingData);

      expect(response.status).toBe(404);
      expect(response.body.message).toContain("Vehicle not found");
    });

    it("rejects invalid payload with 400", async () => {
      const invalidData = {
        vehicle_id: testVehicleId,
        // Missing required fields
      };

      const response = await request(app.getHttpServer()).post(baseUrl).send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBeDefined();
    });

    it("allows pricing with effective_to date", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      const pricingData = {
        vehicle_id: testVehicleId,
        price_per_hour: 50,
        price_per_day: 400,
        effective_from: new Date().toISOString(),
        effective_to: futureDate.toISOString(),
        deposit_amount: 1000,
      };

      const response = await request(app.getHttpServer()).post(baseUrl).send(pricingData);

      expect(response.status).toBe(201);
      expect(response.body.data.effective_to).toBeDefined();
    });
  });

  describe("PUT /pricings/:id", () => {
    it("updates pricing and returns 200", async () => {
      const pricing = await createPricing();
      const updateData = {
        vehicle_id: testVehicleId,
        price_per_hour: 60,
        price_per_day: 500,
        effective_from: new Date().toISOString(),
        deposit_amount: 1200,
      };

      const response = await request(app.getHttpServer()).put(`${baseUrl}/${pricing._id}`).send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.data).toMatchObject({
        price_per_hour: 60,
        price_per_day: 500,
        deposit_amount: 1200,
      });
    });

    it("returns 404 for non-existent pricing", async () => {
      const nonExistingId = new mongoose.Types.ObjectId().toString();
      const updateData = {
        vehicle_id: testVehicleId,
        price_per_hour: 60,
        price_per_day: 500,
        effective_from: new Date().toISOString(),
        deposit_amount: 1200,
      };

      const response = await request(app.getHttpServer()).put(`${baseUrl}/${nonExistingId}`).send(updateData);

      expect(response.status).toBe(404);
      expect(response.body.message).toContain("Pricing not found");
    });
  });

  describe("DELETE /pricings/:id", () => {
    it("deletes pricing and returns 200", async () => {
      const pricing = await createPricing();
      const response = await request(app.getHttpServer()).delete(`${baseUrl}/${pricing._id}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain("Pricing deleted successfully");

      // Verify it's deleted
      const deleted = await pricingModel.findById(pricing._id);
      expect(deleted).toBeNull();
    });

    it("returns 404 for non-existent pricing", async () => {
      const nonExistingId = new mongoose.Types.ObjectId().toString();
      const response = await request(app.getHttpServer()).delete(`${baseUrl}/${nonExistingId}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toContain("Pricing not found");
    });
  });

  describe("GET /pricings/vehicle/:vehicleId/history", () => {
    it("returns all pricing history for a vehicle", async () => {
      // Create a fresh vehicle for this test
      const freshVehicleId = await createVehicle();
      const currentDate = new Date();

      // Create multiple pricings for the fresh vehicle
      await request(app.getHttpServer())
        .post(baseUrl)
        .send({
          vehicle_id: freshVehicleId,
          price_per_hour: 30,
          price_per_day: 300,
          effective_from: new Date(currentDate.getTime() - 172800000), // 2 days ago
          effective_to: new Date(currentDate.getTime() - 86400000), // Ended 1 day ago
          deposit_amount: 900,
        });

      await request(app.getHttpServer())
        .post(baseUrl)
        .send({
          vehicle_id: freshVehicleId,
          price_per_hour: 40,
          price_per_day: 400,
          effective_from: new Date(currentDate.getTime() - 86400000), // 1 day ago
          deposit_amount: 1000,
        });

      await request(app.getHttpServer())
        .post(baseUrl)
        .send({
          vehicle_id: freshVehicleId,
          price_per_hour: 50,
          price_per_day: 500,
          effective_from: new Date(currentDate.getTime() + 86400000), // Future pricing
          deposit_amount: 1100,
        });

      const response = await request(app.getHttpServer()).get(`${baseUrl}/vehicle/${freshVehicleId}/history`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(3);
      expect(response.body.meta.total).toBe(3);

      // Verify they are sorted by effective_from descending (newest first)
      const prices = response.body.data.map((p: any) => p.price_per_day);
      expect(prices).toEqual([500, 400, 300]);
    });

    it("returns empty array for vehicle with no pricing", async () => {
      const newVehicleId = await createVehicle();
      const response = await request(app.getHttpServer()).get(`${baseUrl}/vehicle/${newVehicleId}/history`);

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
      expect(response.body.meta.total).toBe(0);
    });

    it("returns 404 for non-existent vehicle", async () => {
      const nonExistingId = new mongoose.Types.ObjectId().toString();
      const response = await request(app.getHttpServer()).get(`${baseUrl}/vehicle/${nonExistingId}/history`);

      expect(response.status).toBe(404);
      expect(response.body.message).toContain("Vehicle not found");
    });

    it("shows complete pricing timeline including past, current, and future", async () => {
      const freshVehicleId = await createVehicle();
      const now = new Date();

      // Past pricing (expired)
      const pastRes = await request(app.getHttpServer())
        .post(baseUrl)
        .send({
          vehicle_id: freshVehicleId,
          price_per_hour: 30,
          price_per_day: 300,
          effective_from: new Date(now.getTime() - 259200000), // 3 days ago
          effective_to: new Date(now.getTime() - 86400000), // Ended 1 day ago
          deposit_amount: 900,
        });
      const pastPricing = pastRes.body.data;

      // Current pricing
      const currentRes = await request(app.getHttpServer())
        .post(baseUrl)
        .send({
          vehicle_id: freshVehicleId,
          price_per_hour: 40,
          price_per_day: 400,
          effective_from: new Date(now.getTime() - 86400000), // Started 1 day ago
          effective_to: new Date(now.getTime() + 86400000), // Ends tomorrow
          deposit_amount: 1000,
        });
      const currentPricing = currentRes.body.data;

      // Future pricing
      const futureRes = await request(app.getHttpServer())
        .post(baseUrl)
        .send({
          vehicle_id: freshVehicleId,
          price_per_hour: 50,
          price_per_day: 500,
          effective_from: new Date(now.getTime() + 172800000), // Starts in 2 days
          deposit_amount: 1100,
        });
      const futurePricing = futureRes.body.data;

      const response = await request(app.getHttpServer()).get(`${baseUrl}/vehicle/${freshVehicleId}/history`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(3);

      // Verify all three are included
      const pricingIds = response.body.data.map((p: any) => p._id);
      expect(pricingIds).toContain(pastPricing._id);
      expect(pricingIds).toContain(currentPricing._id);
      expect(pricingIds).toContain(futurePricing._id);
    });
  });

  describe("Pricing Business Logic", () => {
    it("allows multiple active pricings with different effective periods", async () => {
      const freshVehicleId = await createVehicle();
      const now = new Date();

      // Current pricing
      await request(app.getHttpServer())
        .post(baseUrl)
        .send({
          vehicle_id: freshVehicleId,
          price_per_hour: 40,
          price_per_day: 400,
          effective_from: new Date(now.getTime() - 86400000),
          effective_to: new Date(now.getTime() + 86400000),
          deposit_amount: 1000,
        });

      // Future pricing (no overlap)
      const futureResponse = await request(app.getHttpServer())
        .post(baseUrl)
        .send({
          vehicle_id: freshVehicleId,
          price_per_hour: 60,
          price_per_day: 500,
          effective_from: new Date(now.getTime() + 172800000), // Starts in 2 days
          deposit_amount: 1200,
        });

      expect(futureResponse.status).toBe(201);

      const historyResponse = await request(app.getHttpServer()).get(`${baseUrl}/vehicle/${freshVehicleId}/history`);

      expect(historyResponse.body.data.length).toBe(2);
    });

    it("stores all pricing fields correctly", async () => {
      const pricingData = {
        vehicle_id: testVehicleId,
        price_per_hour: 55,
        price_per_day: 450,
        effective_from: new Date().toISOString(),
        deposit_amount: 1100,
        late_return_fee_per_hour: 120,
        mileage_limit_per_day: 250,
        excess_mileage_fee: 8,
      };

      const response = await request(app.getHttpServer()).post(baseUrl).send(pricingData);

      expect(response.status).toBe(201);
      expect(response.body.data).toMatchObject({
        price_per_hour: 55,
        price_per_day: 450,
        deposit_amount: 1100,
        late_return_fee_per_hour: 120,
        mileage_limit_per_day: 250,
        excess_mileage_fee: 8,
      });
    });
  });
});
