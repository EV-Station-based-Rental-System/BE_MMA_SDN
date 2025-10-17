import { INestApplication, ValidationPipe } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import { HttpErrorInterceptor } from "src/common/interceptors/http-error.interceptor";
import { VehicleModule } from "src/modules/vehicles/vehicles.module";
import { ConfigModule } from "@nestjs/config";
import configuration from "src/common/config/config";
import { applyAuthGuardOverrides } from "./utils/auth-helpers";

const baseUrl = "/vehicle";

describe("VehicleModule (e2e)", () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;

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
      imports: [ConfigModule.forRoot({ isGlobal: true, load: [configuration] }), MongooseModule.forRoot(await mongoServer.getUri()), VehicleModule],
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
});
