import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Role } from "src/common/enums/role.enum";
import { ForbiddenException } from "src/common/exceptions/forbidden.exception";
import { ROLES_KEY } from "src/common/decorators/roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: { roles?: string | string[] } }>();
    const userRoles = this.normalizeRoles(request.user?.roles);

    const hasRole = requiredRoles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      throw new ForbiddenException("Insufficient permissions");
    }

    return true;
  }

  private normalizeRoles(roles: string | string[] | undefined): Role[] {
    if (!roles) {
      return [];
    }

    const list = Array.isArray(roles) ? roles : [roles];
    return list.filter((role): role is Role => Object.values(Role).includes(role as Role));
  }
}
