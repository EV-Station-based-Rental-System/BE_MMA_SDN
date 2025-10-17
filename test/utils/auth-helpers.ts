import { TestingModuleBuilder } from "@nestjs/testing";
import { Role } from "src/common/enums/role.enum";
import { JwtAuthGuard } from "src/common/guards/jwt.guard";
import { RolesGuard } from "src/common/guards/roles.guard";

export const createFakeAdminUser = () => ({
  _id: "fake-user",
  role: Role.ADMIN,
});

export const applyAuthGuardOverrides = (moduleBuilder: TestingModuleBuilder): TestingModuleBuilder => {
  moduleBuilder.overrideGuard(JwtAuthGuard).useValue({
    canActivate: (context: any) => {
      const request = context.switchToHttp().getRequest();
      request.user = createFakeAdminUser();
      return true;
    },
  });

  moduleBuilder.overrideGuard(RolesGuard).useValue({
    canActivate: () => true,
  });

  return moduleBuilder;
};
