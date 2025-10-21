import { TestingModuleBuilder } from "@nestjs/testing";
import { Role } from "src/common/enums/role.enum";
import { JwtAuthGuard } from "src/common/guards/jwt.guard";
import { RolesGuard } from "src/common/guards/roles.guard";

export type FakeUser = {
  _id: string;
  email: string;
  full_name: string;
  role: Role | Role[];
};

export const createFakeUser = (overrides: Partial<FakeUser> = {}): FakeUser => ({
  _id: "fake-user",
  email: "test@example.com",
  full_name: "Test User",
  role: Role.ADMIN,
  ...overrides,
});

export const applyAuthGuardOverrides = (moduleBuilder: TestingModuleBuilder, userOverrides: Partial<FakeUser> = {}): TestingModuleBuilder => {
  const fakeUser = createFakeUser(userOverrides);

  moduleBuilder.overrideGuard(JwtAuthGuard).useValue({
    canActivate: (context: any) => {
      const request = context.switchToHttp().getRequest();
      request.user = fakeUser;
      return true;
    },
  });

  moduleBuilder.overrideGuard(RolesGuard).useValue({
    canActivate: () => true,
  });

  return moduleBuilder;
};
