import { INestApplication, ValidationPipe } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import { HttpErrorInterceptor } from "src/common/interceptors/http-error.interceptor";
import { ConfigModule } from "@nestjs/config";
import configuration from "src/common/config/config";
import { VehicleStationModule } from "src/modules/vehicle_station/vehicle_station.module";
import { applyAuthGuardOverrides } from "./utils/auth-helpers";
import { Role } from "src/common/enums/role.enum";

const baseUrl = "/vehicle-station";

describe("VehicleStationModule (e2e)", () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;

  const validVehiclePayload = {
    make: "Tesla",
    model: "Model 3",
    model_year: 2024,
    category: "EV",
  };

  const validStationPayload = {
    name: "EV Hub",
    address: "456 Station Lane",
  };

  const baseVehicleAtStationPayload = {
    current_mileage: 1000,
    status: "available",
  };

  const getCollection = (name: string) => mongoose.connection.collection(name);

  const seedVehicle = async (payload: Record<string, unknown>) => {
    const doc = await getCollection("vehicles").insertOne(payload);
    return doc.insertedId.toString();
  };

  const seedStation = async (payload: Record<string, unknown>) => {
    const doc = await getCollection("stations").insertOne(payload);
    return doc.insertedId.toString();
  };

  const createVehicleAtStation = async (override: Record<string, unknown> = {}) => {
    const payload = await buildVehicleStationPayload(override);

    const response = await request(app.getHttpServer()).post(baseUrl).send(payload);

    expect(response.status).toBe(201);
    return { response, vehicleId: payload.vehicle_id as string, stationId: payload.station_id as string };
  };

  const buildVehicleStationPayload = async (override: Record<string, unknown> = {}) => {
    const now = new Date();
    const vehicleId = await seedVehicle({
      ...validVehiclePayload,
      is_active: true,
      created_at: now,
    });

    const stationId = await seedStation({
      ...validStationPayload,
      is_active: true,
      created_at: now,
    });

    return {
      vehicle_id: vehicleId,
      station_id: stationId,
      ...baseVehicleAtStationPayload,
      ...override,
    };
  };

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();

    const moduleBuilder = Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
        MongooseModule.forRoot(await mongoServer.getUri()),
        VehicleStationModule,
      ],
    });

    const moduleFixture: TestingModule = await applyAuthGuardOverrides(moduleBuilder, { role: [Role.ADMIN, Role.STAFF] }).compile();

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

  it("POST /vehicle-station creates a record and returns 201", async () => {
    const payload = buildVehicleStationPayload();
    const response = await request(app.getHttpServer()).post(baseUrl).send(payload);

    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({
      vehicle_id: payload.vehicle_id,
      station_id: payload.station_id,
      current_mileage: baseVehicleAtStationPayload.current_mileage,
    });
  });

  it("POST /vehicle-station rejects invalid payload with 400", async () => {
    const payload = await buildVehicleStationPayload({ vehicle_id: "not-an-objectId" });
    const response = await request(app.getHttpServer()).post(baseUrl).send(payload);

    expect(response.status).toBe(400);
    expect(response.body.message).toBeDefined();
  });

  it("GET /vehicle-station returns paginated list with 200", async () => {
    const { response: createResponse } = await createVehicleAtStation();
    const response = await request(app.getHttpServer()).get(baseUrl).query({ page: 1, take: 5 });

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    const createdId = createResponse.body.data._id;
    expect(response.body.data.some((item: { _id: string }) => item._id === createdId)).toBe(true);
    expect(response.body.meta).toMatchObject({
      page: 1,
      take: 5,
    });
    expect(response.body.meta.total).toBeGreaterThanOrEqual(1);
  });

  it("GET /vehicle-station/:id returns detail with 200", async () => {
    const { response: createResponse } = await createVehicleAtStation();
    const id = createResponse.body.data._id;

    const response = await request(app.getHttpServer()).get(`${baseUrl}/${id}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      _id: id,
    });
  });

  it("GET /vehicle-station/:id returns 404 for unknown id", async () => {
    const nonExistingId = new mongoose.Types.ObjectId().toString();
    const response = await request(app.getHttpServer()).get(`${baseUrl}/${nonExistingId}`);

    expect(response.status).toBe(404);
  });

  it("PUT /vehicle-station/:id updates record and returns 200", async () => {
    const { response: createResponse } = await createVehicleAtStation();
    const id = createResponse.body.data._id;

    const payload = await buildVehicleStationPayload({
      vehicle_id: createResponse.body.data.vehicle_id,
      station_id: createResponse.body.data.station_id,
    });
    const response = await request(app.getHttpServer()).put(`${baseUrl}/${id}`).send({ current_mileage: 2000, end_time: payload.end_time });

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      _id: id,
      current_mileage: 2000,
    });
  });

  it("PUT /vehicle-station/:id returns 404 for unknown record", async () => {
    const nonExistingId = new mongoose.Types.ObjectId().toString();
    const response = await request(app.getHttpServer()).put(`${baseUrl}/${nonExistingId}`).send({ current_mileage: 2000 });

    expect(response.status).toBe(404);
  });

  it("PATCH /vehicle-station/changeStatus/:id updates status and returns 200", async () => {
    const { response: createResponse } = await createVehicleAtStation();
    const id = createResponse.body.data._id;

    const response = await request(app.getHttpServer()).patch(`${baseUrl}/changeStatus/${id}`).send({ status: "maintain" });

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      _id: id,
      status: "maintain",
    });
  });

  it("PATCH /vehicle-station/changeStatus/:id returns 404 for unknown record", async () => {
    const nonExistingId = new mongoose.Types.ObjectId().toString();
    const response = await request(app.getHttpServer()).patch(`${baseUrl}/changeStatus/${nonExistingId}`).send({ status: "maintain" });

    expect(response.status).toBe(404);
  });

  it("DELETE /vehicle-station/:id removes record and returns 200", async () => {
    const { response: createResponse } = await createVehicleAtStation();
    const id = createResponse.body.data._id;

    const response = await request(app.getHttpServer()).delete(`${baseUrl}/${id}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toContain("Vehicle at station deleted successfully");
  });
});
