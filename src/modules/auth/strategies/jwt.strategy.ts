import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { InternalServerErrorException } from "src/common/exceptions/internal-server-error.exception";

import { AuthService } from "../auth.service";
import { BaseJwtUserPayload } from "src/common/utils/type";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    const jwtSecret = configService.get<string>("jwt.secret");
    if (!jwtSecret) {
      throw new InternalServerErrorException("JWT secret is not defined");
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: BaseJwtUserPayload) {
    await this.authService.checkStatus(payload);
    return payload;
  }
}
