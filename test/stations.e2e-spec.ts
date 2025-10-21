import { INestApplication, ValidationPipe } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import { HttpErrorInterceptor } from "src/common/interceptors/http-error.interceptor";
import { ConfigModule } from "@nestjs/config";
import configuration from "src/common/config/config";
import { StationModule } from "src/modules/stations/stations.module";
import { applyAuthGuardOverrides } from "./utils/auth-helpers";

const baseUrl = "/station";

describe("StationModule (e2e)", () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;

  const validPayload = {
    name: "Central Station",
    address: "123 Main St",
  };

  const createStation = async (override: Record<string, unknown> = {}) => {
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
      imports: [ConfigModule.forRoot({ isGlobal: true, load: [configuration] }), MongooseModule.forRoot(await mongoServer.getUri()), StationModule],
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

  it("POST /station creates a station and returns 201", async () => {
    const response = await request(app.getHttpServer()).post(baseUrl).send(validPayload);

    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({
      name: validPayload.name,
      address: validPayload.address,
    });
    expect(response.body.data).toHaveProperty("_id");
  });

  it("POST /station rejects invalid payload with 400", async () => {
    const response = await request(app.getHttpServer()).post(baseUrl).send({ name: 123 });

    expect(response.status).toBe(400);
    expect(response.body.message).toBeDefined();
  });

  it("GET /station returns a paginated list with 200", async () => {
    const created = await createStation();
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

  it("GET /station/:id returns station detail with 200", async () => {
    const created = await createStation();
    const response = await request(app.getHttpServer()).get(`${baseUrl}/${created._id}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      _id: created._id,
      name: validPayload.name,
    });
  });

  it("GET /station/:id returns 404 for unknown station", async () => {
    const nonExistingId = new mongoose.Types.ObjectId().toString();
    const response = await request(app.getHttpServer()).get(`${baseUrl}/${nonExistingId}`);

    expect(response.status).toBe(404);
  });

  it("PUT /station/:id updates station and returns 200", async () => {
    const created = await createStation();
    const response = await request(app.getHttpServer()).put(`${baseUrl}/${created._id}`).send({ name: "Updated Station" });

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      _id: created._id,
      name: "Updated Station",
    });
  });

  it("PUT /station/:id returns 404 for unknown station", async () => {
    const nonExistingId = new mongoose.Types.ObjectId().toString();
    const response = await request(app.getHttpServer()).put(`${baseUrl}/${nonExistingId}`).send({ name: "Unknown" });

    expect(response.status).toBe(404);
  });

  it("PATCH /station/soft-delete/:id marks station removed with 200", async () => {
    const created = await createStation();
    const response = await request(app.getHttpServer()).patch(`${baseUrl}/soft-delete/${created._id}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBeDefined();
  });

  it("DELETE /station/:id removes station and returns 200", async () => {
    const created = await createStation();
    const response = await request(app.getHttpServer()).delete(`${baseUrl}/${created._id}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toContain("Station hard deleted successfully");
  });
});
