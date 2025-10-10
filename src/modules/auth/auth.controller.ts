import { Controller, Post, UseGuards, Request, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalGuard } from 'src/common/guards/local.guard';
import { StaffJwtUserPayload, AdminJwtUserPayload, RenterJwtUserPayload } from 'src/common/utils/type';
import { ApiBody, ApiCreatedResponse, ApiForbiddenResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { RenterDto } from './dto/renter.dto';
import { LoginDto } from './dto/login.dto';
import { StaffDto } from './dto/staff.dto';
import { AdminDto } from './dto/admin.dto';
import { VerifyOtpDto } from 'src/common/mail/dto/verifyOtp.dto';
import { SendOtpDto } from 'src/common/mail/dto/sendEmail.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { MessageResponseDto } from './dto/message-response.dto';

const buildErrorResponse = (statusCode: number, messageExample: string) => ({
  schema: {
    type: 'object',
    required: ['statusCode', 'message'],
    properties: {
      statusCode: { type: 'integer', example: statusCode },
      message: { type: 'string', example: messageExample },
      errorCode: {
        type: 'string',
        nullable: true,
        example: null,
      },
    },
  },
});

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalGuard)
  @ApiBody({ type: LoginDto })
  @Post('login')
  @ApiCreatedResponse({ description: 'JWT access token', type: LoginResponseDto })
  @ApiForbiddenResponse({
    description: 'Incorrect password',
    ...buildErrorResponse(403, 'Wrong password'),
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    ...buildErrorResponse(404, 'User not found'),
  })
  login(@Request() req: { user: RenterJwtUserPayload | StaffJwtUserPayload | AdminJwtUserPayload }) {
    return this.authService.login(req.user);
  }

  @Post('register/renter')
  @ApiBody({ type: RenterDto })
  @ApiCreatedResponse({
    description: 'Renter account created',
    type: MessageResponseDto,
  })
  async createRenter(@Body() body: RenterDto) {
    return this.authService.createRenter(body);
  }

  @Post('register/staff')
  @ApiBody({ type: StaffDto })
  @ApiCreatedResponse({
    description: 'Staff account created',
    type: MessageResponseDto,
  })
  async createStaff(@Body() body: StaffDto) {
    return this.authService.createStaff(body);
  }

  @Post('register/admin')
  @ApiBody({ type: AdminDto })
  @ApiCreatedResponse({
    description: 'Admin account created',
    type: MessageResponseDto,
  })
  async createAdmin(@Body() body: AdminDto) {
    return this.authService.createAdmin(body);
  }

  @Post('send-otp')
  @ApiBody({ type: SendOtpDto })
  @ApiCreatedResponse({
    description: 'OTP email sent',
    type: MessageResponseDto,
  })
  async sendOtp(@Body() body: SendOtpDto) {
    return this.authService.sendOtp(body);
  }

  @Post('verify-email')
  @ApiBody({ type: VerifyOtpDto })
  @ApiCreatedResponse({
    description: 'OTP verified successfully',
    type: MessageResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Invalid OTP code',
    ...buildErrorResponse(403, 'Invalid OTP'),
  })
  async verifyEmail(@Body() body: VerifyOtpDto) {
    return this.authService.verifyEmail(body);
  }

  @Post('reset-password')
  @ApiBody({ type: ResetPasswordDto })
  @ApiCreatedResponse({
    description: 'Password reset completed',
    type: MessageResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User not found for provided email',
    ...buildErrorResponse(404, 'User not found'),
  })
  async resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body);
  }
}
