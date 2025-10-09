import { Controller, Post, UseGuards, Request, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalGuard } from 'src/common/guards/local.guard';
import { StaffJwtUserPayload, AdminJwtUserPayload, RenterJwtUserPayload } from 'src/common/utils/type';
import { ApiBody } from '@nestjs/swagger';
import { RenterDto } from './dto/renter.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
}
