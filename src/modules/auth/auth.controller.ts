import { Controller, Post, UseGuards, Request, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalGuard } from 'src/common/guards/local.guard';
import { StaffJwtUserPayload, AdminJwtUserPayload, RenterJwtUserPayload } from 'src/common/utils/type';
import { ApiBody } from '@nestjs/swagger';
import { RenterDto } from './dto/renter.dto';
import { LoginDto } from './dto/login.dto';
import { StaffDto } from './dto/staff.dto';
import { AdminDto } from './dto/admin.dto';
import { VerifyOtpDto } from 'src/common/mail/dto/verifyOtp.dto';
import { SendOtpDto } from 'src/common/mail/dto/sendEmail.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @UseGuards(LocalGuard)
  @ApiBody({ type: LoginDto })
  @Post('login')
  login(@Request() req: { user: RenterJwtUserPayload | StaffJwtUserPayload | AdminJwtUserPayload }) {
    return this.authService.login(req.user);
  }

  @Post('register/renter')
  @ApiBody({ type: RenterDto })
  async createRenter(@Body() body: RenterDto) {
    return this.authService.createRenter(body);
  }

  @Post('register/staff')
  @ApiBody({ type: StaffDto })
  async createStaff(@Body() body: StaffDto) {
    return this.authService.createStaff(body);
  }

  @Post('register/admin')
  @ApiBody({ type: AdminDto })
  async createAdmin(@Body() body: AdminDto) {
    return this.authService.createAdmin(body);
  }

  @Post('send-otp')
  @ApiBody({ type: SendOtpDto })
  async sendOtp(@Body() body: SendOtpDto) {
    return this.authService.sendOtp(body);
  }

  @Post('verify-email')
  @ApiBody({ type: VerifyOtpDto })
  async verifyEmail(@Body() body: VerifyOtpDto) {
    return this.authService.verifyEmail(body);
  }

  @Post('reset-password')
  @ApiBody({ type: ResetPasswordDto })
  async resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body);
  }

}
