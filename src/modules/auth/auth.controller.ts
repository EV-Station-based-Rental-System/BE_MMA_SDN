import { Controller, Post, UseGuards, Request, Body } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LocalGuard } from "src/common/guards/local.guard";
import { StaffJwtUserPayload, AdminJwtUserPayload, RenterJwtUserPayload } from "src/common/utils/type";

import { RenterDto } from "./dto/renter.dto";
import { LoginDto } from "./dto/login.dto";
import { StaffDto } from "./dto/staff.dto";
import { AdminDto } from "./dto/admin.dto";
import { VerifyOtpDto } from "src/common/mail/dto/verifyOtp.dto";
import { SendOtpDto } from "src/common/mail/dto/sendEmail.dto";
import { ResetPasswordDto } from "./dto/resetPassword.dto";
import { ApiBody, ApiCreatedResponse, ApiTags, ApiExtraModels } from "@nestjs/swagger";
import { ApiErrorResponses } from "src/common/decorator/swagger.decorator";
import { Renter } from "src/models/renter.schema";
import { Staff } from "src/models/staff.schema";
import { Admin } from "src/models/admin.schema";
import { ResponseMsg } from "src/common/response/response-message";

@ApiTags("Auth")
@ApiExtraModels(Renter, Staff, Admin)
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // =====================
  // LOGIN
  // =====================
  @Post("login")
  @UseGuards(LocalGuard)
  @ApiCreatedResponse({
    description: "Login successful. Returns JWT access token.",
    schema: {
      type: "object",
      properties: {
        data: {
          type: "object",
          properties: {
            access_token: { type: "string" },
          },
        },
      },
    },
  })
  @ApiErrorResponses()
  @ApiBody({ type: LoginDto })
  login(@Request() req: { user: RenterJwtUserPayload | StaffJwtUserPayload | AdminJwtUserPayload }) {
    return this.authService.login(req.user);
  }

  // =====================
  // REGISTER RENTER
  // =====================
  @Post("register/renter")
  @ApiCreatedResponse({ description: "Renter created successfully", type: ResponseMsg })
  @ApiErrorResponses()
  @ApiBody({ type: RenterDto })
  async createRenter(@Body() body: RenterDto) {
    return this.authService.createRenter(body);
  }

  // =====================
  // REGISTER STAFF
  // =====================
  @Post("register/staff")
  // @UseGuards(JwtAuthGuard, RolesGuard) tam thoi bo qua guard de test
  // @Roles(Role.ADMIN)
  // @ApiBearerAuth()
  @ApiCreatedResponse({ description: "Staff created successfully", type: ResponseMsg })
  @ApiErrorResponses()
  @ApiBody({ type: StaffDto })
  async createStaff(@Body() body: StaffDto) {
    return this.authService.createStaff(body);
  }

  // =====================
  // REGISTER ADMIN
  // =====================
  @Post("register/admin")
  // @UseGuards(JwtAuthGuard, RolesGuard) tam thoi bo qua guard de test
  // @Roles(Role.ADMIN)
  // @ApiBearerAuth()
  @ApiCreatedResponse({ description: "Admin created successfully", type: ResponseMsg })
  @ApiErrorResponses()
  @ApiBody({ type: AdminDto })
  async createAdmin(@Body() body: AdminDto) {
    return this.authService.createAdmin(body);
  }

  // =====================
  // SEND OTP
  // =====================
  @Post("send-otp")
  @ApiCreatedResponse({ description: "OTP sent successfully", type: ResponseMsg })
  @ApiErrorResponses()
  @ApiBody({ type: SendOtpDto })
  async sendOtp(@Body() body: SendOtpDto) {
    return this.authService.sendOtp(body);
  }

  // =====================
  // VERIFY EMAIL
  // =====================
  @Post("verify-email")
  @ApiCreatedResponse({ description: "Email verified successfully", type: ResponseMsg })
  @ApiErrorResponses()
  @ApiBody({ type: VerifyOtpDto })
  async verifyEmail(@Body() body: VerifyOtpDto) {
    return this.authService.verifyEmail(body);
  }

  // =====================
  // RESET PASSWORD
  // =====================
  @Post("reset-password")
  @ApiCreatedResponse({ description: "Password reset successfully", type: ResponseMsg })
  @ApiErrorResponses()
  @ApiBody({ type: ResetPasswordDto })
  async resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body);
  }
}
