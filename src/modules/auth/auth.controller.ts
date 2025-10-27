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
import {
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiTags,
  ApiOperation,
} from "@nestjs/swagger";
import { ResponseDetail } from "src/common/response/response-detail-create-update";
import { ResponseNotFound } from "src/common/response/error/response-notfound";
import { ResponseConflict } from "src/common/response/error/response-conflict";
import { ResponseInternalError } from "src/common/response/error/response-internal-error";
import { ResponseBadRequest } from "src/common/response/error/response-bad-request";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // =====================
  // LOGIN
  // =====================
  @UseGuards(LocalGuard)
  @Post("login")
  @ApiOperation({ summary: "Login with email and password" })
  @ApiBody({ type: LoginDto })
  @ApiCreatedResponse({
    description: "Login successful. Returns JWT access token.",
    type: ResponseDetail,
  })
  @ApiNotFoundResponse({
    description: "User not found or invalid credentials",
    type: ResponseNotFound,
  })
  @ApiInternalServerErrorResponse({
    description: "Server error",
    type: ResponseInternalError,
  })
  login(@Request() req: { user: RenterJwtUserPayload | StaffJwtUserPayload | AdminJwtUserPayload }) {
    return this.authService.login(req.user);
  }

  // =====================
  // REGISTER RENTER
  // =====================
  @Post("register/renter")
  @ApiOperation({ summary: "Register new renter user" })
  @ApiBody({ type: RenterDto })
  @ApiCreatedResponse({
    description: "Renter created successfully",
    type: ResponseDetail,
  })
  @ApiConflictResponse({
    description: "Email already exists",
    type: ResponseConflict,
  })
  @ApiBadRequestResponse({
    description: "Invalid renter payload",
    type: ResponseBadRequest,
  })
  @ApiInternalServerErrorResponse({
    description: "Server error",
    type: ResponseInternalError,
  })
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
  @ApiOperation({ summary: "Register new staff" })
  @ApiBody({ type: StaffDto })
  @ApiCreatedResponse({
    description: "Staff created successfully",
    type: ResponseDetail,
  })
  @ApiConflictResponse({
    description: "Email already exists",
    type: ResponseConflict,
  })
  @ApiBadRequestResponse({
    description: "Invalid staff payload",
    type: ResponseBadRequest,
  })
  @ApiInternalServerErrorResponse({
    description: "Server error",
    type: ResponseInternalError,
  })
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
  @ApiOperation({ summary: "Register new admin" })
  @ApiBody({ type: AdminDto })
  @ApiCreatedResponse({
    description: "Admin created successfully",
    type: ResponseDetail,
  })
  @ApiConflictResponse({
    description: "Email already exists",
    type: ResponseConflict,
  })
  @ApiBadRequestResponse({
    description: "Invalid admin payload",
    type: ResponseBadRequest,
  })
  @ApiInternalServerErrorResponse({
    description: "Server error",
    type: ResponseInternalError,
  })
  async createAdmin(@Body() body: AdminDto) {
    return this.authService.createAdmin(body);
  }

  // =====================
  // SEND OTP
  // =====================
  @Post("send-otp")
  @ApiOperation({ summary: "Send OTP to email for verification" })
  @ApiBody({ type: SendOtpDto })
  @ApiCreatedResponse({
    description: "OTP sent successfully",
    type: ResponseDetail,
  })
  @ApiNotFoundResponse({
    description: "Email not registered",
    type: ResponseNotFound,
  })
  @ApiInternalServerErrorResponse({
    description: "Server error",
    type: ResponseInternalError,
  })
  async sendOtp(@Body() body: SendOtpDto) {
    return this.authService.sendOtp(body);
  }

  // =====================
  // VERIFY EMAIL
  // =====================
  @Post("verify-email")
  @ApiOperation({ summary: "Verify email using OTP" })
  @ApiBody({ type: VerifyOtpDto })
  @ApiCreatedResponse({
    description: "Email verified successfully",
    type: ResponseDetail,
  })
  @ApiBadRequestResponse({
    description: "Invalid or expired OTP",
    type: ResponseBadRequest,
  })
  @ApiInternalServerErrorResponse({
    description: "Server error",
    type: ResponseInternalError,
  })
  async verifyEmail(@Body() body: VerifyOtpDto) {
    return this.authService.verifyEmail(body);
  }

  // =====================
  // RESET PASSWORD
  // =====================
  @Post("reset-password")
  @ApiOperation({ summary: "Reset password using verified email" })
  @ApiBody({ type: ResetPasswordDto })
  @ApiCreatedResponse({
    description: "Password reset successfully",
    type: ResponseDetail,
  })
  @ApiBadRequestResponse({
    description: "Invalid payload or unverified email",
    type: ResponseBadRequest,
  })
  @ApiInternalServerErrorResponse({
    description: "Server error",
    type: ResponseInternalError,
  })
  async resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body);
  }
}
