import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { MongoMemoryServer } from "mongodb-memory-server";
import { MongooseModule, getModelToken } from "@nestjs/mongoose";
import mongoose, { Model } from "mongoose";
import request from "supertest";
import { UsersModule } from "src/modules/users/users.module";
import { HttpErrorInterceptor } from "src/common/interceptors/http-error.interceptor";
import { ConfigModule } from "@nestjs/config";
import configuration from "src/common/config/config";
import { applyAuthGuardOverrides } from "./utils/auth-helpers";
import { User } from "src/models/user.schema";
import { Role } from "src/common/enums/role.enum";

describe("UsersModule soft-delete/restore (e2e)", () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let userModel: Model<User>;

  const createUser = async (override: Partial<User> = {}) => {
    const doc = new userModel({
      email: `user_${Date.now()}@ex.com`,
      password: "hashed",
      full_name: "Test User",
      role: Role.RENTER,
      ...override,
    });
    return await doc.save();
  };

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();

    const moduleBuilder = Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true, load: [configuration] }), MongooseModule.forRoot(await mongoServer.getUri()), UsersModule],
    });

    const moduleFixture: TestingModule = await applyAuthGuardOverrides(moduleBuilder).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    app.useGlobalInterceptors(new HttpErrorInterceptor());
    await app.init();

    userModel = moduleFixture.get<Model<User>>(getModelToken(User.name));
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

  it("PATCH /user/soft-delete/:id sets is_active=false", async () => {
    const user = await createUser({ is_active: true });
    const res = await request(app.getHttpServer()).patch(`/user/soft-delete/${user._id}`);
    expect(res.status).toBe(200);

    const check = await request(app.getHttpServer()).get(`/user/${user._id}`);
    expect(check.status).toBe(200);
    expect(check.body.data.is_active).toBe(false);
  });

  it("PATCH /user/restore/:id sets is_active=true", async () => {
    const user = await createUser({ is_active: false });
    const res = await request(app.getHttpServer()).patch(`/user/restore/${user._id}`);
    expect(res.status).toBe(200);

    const check = await request(app.getHttpServer()).get(`/user/${user._id}`);
    expect(check.status).toBe(200);
    expect(check.body.data.is_active).toBe(true);
  });
});
