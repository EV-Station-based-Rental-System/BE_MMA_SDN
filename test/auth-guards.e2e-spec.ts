import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";
import { AuthController } from "src/modules/auth/auth.controller";
import { AuthService } from "src/modules/auth/auth.service";
import { HttpErrorInterceptor } from "src/common/interceptors/http-error.interceptor";
import { applyAuthGuardOverrides } from "./utils/auth-helpers";

describe("AuthModule guards (e2e)", () => {
  describe("Unauthorized access", () => {
    let app: INestApplication;

    beforeAll(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        controllers: [AuthController],
        providers: [
          {
            provide: AuthService,
            useValue: {
              createStaff: jest.fn(),
              createAdmin: jest.fn(),
              createRenter: jest.fn(),
              login: jest.fn(),
            },
          },
        ],
      }).compile();

      app = moduleFixture.createNestApplication();
      app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
      app.useGlobalInterceptors(new HttpErrorInterceptor());
      await app.init();
    });

    afterAll(async () => {
      await app.close();
    });

    it("POST /auth/register/staff should be unauthorized (401)", async () => {
      const resp = await request(app.getHttpServer())
        .post("/auth/register/staff")
        .send({ email: "a@b.com", password: "Password1", full_name: "A", position: "Manager" });
      expect(resp.status).toBe(401);
    });

    it("POST /auth/register/admin should be unauthorized (401)", async () => {
      const resp = await request(app.getHttpServer())
        .post("/auth/register/admin")
        .send({ email: "a@b.com", password: "Password1", full_name: "A", title: "Mgr" });
      expect(resp.status).toBe(401);
    });
  });

  describe("Authorized as admin", () => {
    let app: INestApplication;

    beforeAll(async () => {
      const moduleBuilder = Test.createTestingModule({
        controllers: [AuthController],
        providers: [
          {
            provide: AuthService,
            useValue: {
              createStaff: jest.fn().mockResolvedValue({ message: "ok" }),
              createAdmin: jest.fn().mockResolvedValue({ message: "ok" }),
              createRenter: jest.fn(),
              login: jest.fn(),
            },
          },
        ],
      });

      const moduleFixture: TestingModule = await applyAuthGuardOverrides(moduleBuilder).compile();

      app = moduleFixture.createNestApplication();
      app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
      app.useGlobalInterceptors(new HttpErrorInterceptor());
      await app.init();
    });

    afterAll(async () => {
      await app.close();
    });

    it("POST /auth/register/staff should allow admin (201)", async () => {
      const resp = await request(app.getHttpServer())
        .post("/auth/register/staff")
        .send({ email: "staff@ex.com", password: "Password1", full_name: "Staff A", position: "Manager" });
      expect(resp.status).toBe(201);
    });

    it("POST /auth/register/admin should allow admin (201)", async () => {
      const resp = await request(app.getHttpServer())
        .post("/auth/register/admin")
        .send({ email: "admin@ex.com", password: "Password1", full_name: "Admin A", title: "CTO" });
      expect(resp.status).toBe(201);
    });
  });
});
