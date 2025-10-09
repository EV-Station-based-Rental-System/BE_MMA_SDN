import { Injectable } from '@nestjs/common';
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

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userRepository: Model<User>,
    @InjectModel(Staff.name) private staffRepository: Model<Staff>,
    @InjectModel(Admin.name) private adminRepository: Model<Admin>,
    @InjectModel(Renter.name) private renterRepository: Model<Renter>,

    private jwtService: JwtService,
    private configService: ConfigService,
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

    switch (checkUser.role as Role) {
      case Role.ADMIN: {
        const admin = (await this.adminRepository.findOne({ user_id: checkUser._id })) as Admin;
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
        const staff = (await this.staffRepository.findOne({ user_id: checkUser._id })) as Staff;
        if (staff) {
          userPayload = {
            ...userPayload,
            employeeCode: staff.employeeCode,
            position: staff.position,
            hire_date: staff.hire_date,
          } as StaffJwtUserPayload;
        }
        break;
      }

      case Role.RENTER: {
        const renter = (await this.renterRepository.findOne({ user_id: checkUser._id })) as Renter;
        if (renter) {
          userPayload = {
            ...userPayload,
            address: renter.address,
            driver_license: renter.driver_license,
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
    const user = (await this.userRepository.findById(payload._id)) as User;
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

  async createRenter(data: RenterDto) {
    const newUser = new this.userRepository({
      email: data.email,
      password_hash: await hashPassword(data.password_hash),
      full_name: data.full_name,
      role: Role.RENTER,
    });
    await newUser.save();

    // 2️⃣ Tạo Renter kèm user_id
    const newRenter = new this.renterRepository({
      user_id: newUser._id,
      address: data.address,
      driver_license: data.driver_license,
      date_of_birth: data.date_of_birth,
    });

    await newRenter.save();

    return {
      msg: 'Create renter successfully',
    };
  }
}
