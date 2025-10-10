import { Inject, Injectable } from '@nestjs/common';
import { User } from 'src/models/user.schema';
import { LoginDto } from './dto/login.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AdminJwtUserPayload, BaseJwtUserPayload, RenterJwtUserPayload, StaffJwtUserPayload } from 'src/common/utils/type';
import { NotFoundException } from 'src/common/exceptions/not-found.exception';
import { ForbiddenException } from 'src/common/exceptions/forbidden.exception';
import { comparePassword, hashPassword } from 'src/common/utils/helper';
import { Role } from 'src/common/enums/role.enum';
import { Staff } from 'src/models/staff.schema';
import { Admin } from 'src/models/admin.schema';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Renter } from 'src/models/renter.schema';
import { RenterDto } from './dto/renter.dto';
import { StaffDto } from './dto/staff.dto';
import { randomInt } from 'crypto';
import { AdminDto } from './dto/admin.dto';
import { MailService } from 'src/common/mail/mail.service';
import { VerifyOtpDto } from 'src/common/mail/dto/verifyOtp.dto';
import { SendOtpDto } from 'src/common/mail/dto/sendEmail.dto';
import Redis from 'ioredis/built/Redis';
import { ResetPasswordDto } from './dto/resetPassword.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userRepository: Model<User>,
    @InjectModel(Staff.name) private staffRepository: Model<Staff>,
    @InjectModel(Admin.name) private adminRepository: Model<Admin>,
    @InjectModel(Renter.name) private renterRepository: Model<Renter>,

    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
  ) {}

  async validateUser(data: LoginDto): Promise<BaseJwtUserPayload | RenterJwtUserPayload | StaffJwtUserPayload | AdminJwtUserPayload> {
    const checkUser = (await this.userRepository.findOne({ email: data.email })) as User & { _id: string };

    if (!checkUser) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await comparePassword(data.password, checkUser.password_hash);
    if (!isPasswordValid) {
      throw new ForbiddenException('Wrong password');
    }

    let userPayload: BaseJwtUserPayload = {
      _id: checkUser._id,
      email: checkUser.email,
      fullName: checkUser.full_name,
      roles: checkUser.role,
    };

    switch (checkUser.role) {
      case Role.ADMIN: {
        const admin = await this.adminRepository.findOne({ user_id: checkUser._id });
        if (admin) {
          userPayload = {
            ...userPayload,
            title: admin.title,
            hire_date: admin.hire_date,
          } as AdminJwtUserPayload;
        }
        break;
      }

      case Role.STAFF: {
        const staff = await this.staffRepository.findOne({ user_id: checkUser._id });
        if (staff) {
          userPayload = {
            ...userPayload,
            employee_code: staff.employee_code,
            position: staff.position,
            hire_date: staff.hire_date,
          } as StaffJwtUserPayload;
        }
        break;
      }

      case Role.RENTER: {
        const renter = await this.renterRepository.findOne({ user_id: checkUser._id });
        if (renter) {
          userPayload = {
            ...userPayload,
            address: renter.address,
            driver_license_no: renter.driver_license_no,
            date_of_birth: renter.date_of_birth,
            risk_score: renter.risk_score,
          } as RenterJwtUserPayload;
        }
        break;
      }

      default:
        break;
    }
    return userPayload;
  }

  async checkStatus(payload: BaseJwtUserPayload): Promise<void> {
    const user = await this.userRepository.findById(payload._id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!user.is_active) {
      throw new ForbiddenException('Account is disabled');
    }
  }

  login(user: BaseJwtUserPayload | StaffJwtUserPayload | AdminJwtUserPayload) {
    return this.generateToken(user);
  }
  generateToken(payload: BaseJwtUserPayload | StaffJwtUserPayload | AdminJwtUserPayload) {
    const access_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.secret'),
      expiresIn: this.configService.get<string>('jwt.expiresIn'),
    });
    return { access_token };
  }

  async createRenter(data: RenterDto): Promise<{ msg: string }> {
    const newUser = new this.userRepository({
      email: data.email,
      password_hash: await hashPassword(data.password_hash),
      full_name: data.full_name,
      role: Role.RENTER,
    });
    await newUser.save();

    const newRenter = new this.renterRepository({
      user_id: newUser._id,
      address: data.address,
      driver_license_no: data.driver_license_no,
      date_of_birth: data.date_of_birth,
    });

    await newRenter.save();

    return {
      msg: 'Create renter successfully',
    };
  }

  async createStaff(data: StaffDto): Promise<{ msg: string }> {
    const newUser = new this.userRepository({
      email: data.email,
      password_hash: await hashPassword(data.password_hash),
      full_name: data.full_name,
      role: Role.STAFF,
    });
    await newUser.save();

    const newStaff = new this.staffRepository({
      user_id: newUser._id,
      employee_code: this.generateCode(),
      position: data.position,
      hire_date: new Date(),
    });

    await newStaff.save();

    return {
      msg: 'Create staff successfully',
    };
  }
  async createAdmin(data: AdminDto): Promise<{ msg: string }> {
    const newUser = new this.userRepository({
      email: data.email,
      password_hash: await hashPassword(data.password_hash),
      full_name: data.full_name,
      role: Role.ADMIN,
    });
    await newUser.save();

    const newAdmin = new this.adminRepository({
      user_id: newUser._id,
      title: data.title,
      note: data.note,
      hire_date: new Date(),
    });

    await newAdmin.save();

    return {
      msg: 'Create admin successfully',
    };
  }

  private generateCode(): string {
    const otpCode = randomInt(100000, 999999).toString();
    return otpCode;
  }

  async sendOtp(data: SendOtpDto): Promise<{ msg: string }> {
    const randomCode = this.generateCode();
    //send email
    await this.mailService.sendOtp(data.email, randomCode);
    //redis
    await this.redisClient.set(`otp:${data.email}`, randomCode, 'EX', 300);
    return { msg: 'Send OTP successfully' };
  }
  async verifyEmail(data: VerifyOtpDto): Promise<{ msg: string }> {
    const checkOtp = await this.redisClient.get(`otp:${data.email}`);
    if (!checkOtp || checkOtp !== data.otp) {
      throw new ForbiddenException('Invalid OTP');
    }
    await this.redisClient.del(`otp:${data.email}`);
    return { msg: 'Verify email successfully' };
  }
  async resetPassword(data: ResetPasswordDto): Promise<{ msg: string }> {
    // check user
    const user = await this.userRepository.findOne({ email: data.email });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const newPasswordHash = await hashPassword(data.new_password);
    user.password_hash = newPasswordHash;
    await user.save();
    return { msg: 'Reset password successfully' };
  }
}
