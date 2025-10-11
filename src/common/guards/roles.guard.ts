import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ForbiddenException } from '../exceptions/forbidden.exception';
import { Role } from '../enums/role.enum';
import { AuthRequest } from '../interfaces/authRequest.interface';


@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<Role[]>('roles', context.getHandler());
    if (!requiredRoles || requiredRoles.length === 0) return true;


    const request = context.switchToHttp().getRequest<AuthRequest>();
    const user = request.user;
    if (!user) {
      throw new ForbiddenException('No user information found in request.');
    }
    const userRoles = Array.isArray(user.role) ? user.role : [user.role];

    const hasRole = requiredRoles.some(role => userRoles.includes(role));

    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied. Required roles: ${requiredRoles.map(role => this.getRoleName(role)).join(', ')}`,
      );
    }

    return true;
  }

  private getRoleName(role: Role): string {
    switch (role) {
      case Role.ADMIN: return 'Admin';
      case Role.RENTER: return 'Renter';
      case Role.STAFF: return 'Staff';
      default: return 'Unknown';
    }
  }
}

