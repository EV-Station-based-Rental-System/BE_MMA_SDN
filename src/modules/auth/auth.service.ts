import { Inject, Injectable } from "@nestjs/common";
import { User } from "src/models/user.schema";
import { LoginDto } from "./dto/login.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AdminJwtUserPayload, BaseJwtUserPayload, RenterJwtUserPayload, StaffJwtUserPayload } from "src/common/utils/type";
import { NotFoundException } from "src/common/exceptions/not-found.exception";
import { ForbiddenException } from "src/common/exceptions/forbidden.exception";
import { comparePassword, hashPassword } from "src/common/utils/helper";
import { Role } from "src/common/enums/role.enum";
import { Staff } from "src/models/staff.schema";
import { Admin } from "src/models/admin.schema";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { Renter } from "src/models/renter.schema";
import { RenterDto } from "./dto/renter.dto";
import { StaffDto } from "./dto/staff.dto";
import { randomInt } from "crypto";
import { AdminDto } from "./dto/admin.dto";
import { MailService } from "src/common/mail/mail.service";
import { VerifyOtpDto } from "src/common/mail/dto/verifyOtp.dto";
import { SendOtpDto } from "src/common/mail/dto/sendEmail.dto";
import Redis from "ioredis/built/Redis";
import { ResetPasswordDto } from "./dto/resetPassword.dto";
import { ConflictException } from "src/common/exceptions/conflict.exception";
import { ResponseMsg } from "src/common/response/response-message";
import { Station } from "src/models/station.schema";
import { OAuth2Client } from "google-auth-library";

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userRepository: Model<User>,
    @InjectModel(Staff.name) private staffRepository: Model<Staff>,
    @InjectModel(Admin.name) private adminRepository: Model<Admin>,
    @InjectModel(Renter.name) private renterRepository: Model<Renter>,
    @InjectModel(Station.name) private stationRepository: Model<Station>,

    @Inject("REDIS_CLIENT") private readonly redisClient: Redis,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
  ) {}

  async validateUser(data: LoginDto): Promise<BaseJwtUserPayload | RenterJwtUserPayload | StaffJwtUserPayload | AdminJwtUserPayload> {
    const checkUser = (await this.userRepository.findOne({ email: data.email })) as User & { _id: string };

    if (!checkUser) {
      throw new NotFoundException("User not found");
    }

    const isPasswordValid = await comparePassword(data.password, checkUser.password);
    if (!isPasswordValid) {
      throw new ForbiddenException("Wrong password");
    }

    let userPayload: BaseJwtUserPayload = {
      _id: checkUser._id,
      email: checkUser.email,
      full_name: checkUser.full_name,
      role: checkUser.role,
    };

    switch (checkUser.role) {
      case Role.ADMIN: {
        const admin = await this.adminRepository.findOne({ user_id: checkUser._id });
        if (admin) {
          userPayload = {
            ...userPayload,
            title: admin.title,
            notes: admin.notes,
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
      throw new NotFoundException("User not found");
    }
    if (!user.is_active) {
      throw new ForbiddenException("Account is disabled");
    }
  }

  login(user: BaseJwtUserPayload | StaffJwtUserPayload | AdminJwtUserPayload) {
    return { data: this.generateToken(user) };
  }
  generateToken(payload: BaseJwtUserPayload | StaffJwtUserPayload | AdminJwtUserPayload) {
    const access_token = this.jwtService.sign(payload);
    return { access_token };
  }

  async createRenter(data: RenterDto): Promise<ResponseMsg> {
    // check email
    const checkUser = await this.userRepository.findOne({ email: data.email });
    if (checkUser) {
      throw new ConflictException("Email already exists");
    }
    const newUser = new this.userRepository({
      email: data.email,
      password: await hashPassword(data.password),
      full_name: data.full_name,
      role: Role.RENTER,
      is_active: true,
      phone: data.phone,
    });
    await newUser.save();

    const newRenter = new this.renterRepository({
      user_id: newUser._id,
      address: data.address,
      date_of_birth: data.date_of_birth,
      risk_score: 0,
    });

    await newRenter.save();

    return ResponseMsg.ok("Create renter successfully");
  }

  async createStaff(data: StaffDto): Promise<ResponseMsg> {
    // check station
    const checkStation = await this.stationRepository.findById(data.station_id);
    if (!checkStation) {
      throw new NotFoundException("Station not found");
    }
    // check status of station
    if (!checkStation.is_active) {
      throw new ForbiddenException("Station is inactive");
    }
    // check email
    const checkUser = await this.userRepository.findOne({ email: data.email });
    if (checkUser) {
      throw new ConflictException("Email already exists");
    }
    const newUser = new this.userRepository({
      email: data.email,
      password: await hashPassword(data.password),
      full_name: data.full_name,
      role: Role.STAFF,
    });
    await newUser.save();

    const newStaff = new this.staffRepository({
      user_id: newUser._id,
      station_id: data.station_id,
      employee_code: this.generateCode(),
      position: data.position,
      hire_date: new Date(),
    });

    await newStaff.save();

    return ResponseMsg.ok("Create staff successfully");
  }
  async createAdmin(data: AdminDto): Promise<ResponseMsg> {
    // check email
    const checkUser = await this.userRepository.findOne({
      email: data.email,
    });
    if (checkUser) {
      throw new ConflictException("Email already exists");
    }
    const newUser = new this.userRepository({
      email: data.email,
      password: await hashPassword(data.password),
      full_name: data.full_name,
      role: Role.ADMIN,
    });
    await newUser.save();

    const newAdmin = new this.adminRepository({
      user_id: newUser._id,
      title: data.title,
      notes: data.notes,
      hire_date: new Date(),
    });

    await newAdmin.save();

    return ResponseMsg.ok("Create admin successfully");
  }

  private generateCode(): string {
    const otpCode = randomInt(100000, 999999).toString();
    return otpCode;
  }

  async sendOtp(data: SendOtpDto): Promise<ResponseMsg> {
    const randomCode = this.generateCode();
    //send email
    await this.mailService.sendOtp(data.email, randomCode);
    //redis
    await this.redisClient.set(`otp:${data.email}`, randomCode, "EX", 300);
    return ResponseMsg.ok("Send OTP successfully");
  }

  async verifyEmail(data: VerifyOtpDto): Promise<ResponseMsg> {
    const checkOtp = await this.redisClient.get(`otp:${data.email}`);
    if (!checkOtp || checkOtp !== data.otp) {
      throw new ForbiddenException("Invalid OTP");
    }
    await this.redisClient.del(`otp:${data.email}`);
    return ResponseMsg.ok("Verify email successfully");
  }
  async resetPassword(data: ResetPasswordDto): Promise<ResponseMsg> {
    // check user
    const user = await this.userRepository.findOne({ email: data.email });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    const newPasswordHash = await hashPassword(data.new_password);
    user.password = newPasswordHash;
    await user.save();
    return ResponseMsg.ok("Reset password successfully");
  }

  // Login or register using Google ID token
  async loginWithGoogle(idToken: string) {
    if (!idToken) {
      throw new ForbiddenException("Missing id_token");
    }

    // Initialize Google OAuth2 client
    const googleClientIds = [
      this.configService.get<string>("GOOGLE_WEB_CLIENT_ID"),
      this.configService.get<string>("GOOGLE_IOS_CLIENT_ID"),
      this.configService.get<string>("GOOGLE_ANDROID_CLIENT_ID"),
      this.configService.get<string>("GOOGLE_EXPO_CLIENT_ID"),
    ].filter((id): id is string => typeof id === "string" && id.length > 0); // Remove undefined/empty values

    const client = new OAuth2Client();

    // Verify the token with Google
    let email: string;
    let full_name: string;
    try {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: googleClientIds.length > 0 ? googleClientIds : undefined, // Accept any audience if no client IDs configured
      });
      const payload = ticket.getPayload();

      if (!payload) {
        throw new ForbiddenException("Invalid Google ID token payload");
      }

      // Verify token is not expired
      if (payload.exp && payload.exp < Date.now() / 1000) {
        throw new ForbiddenException("Google ID token has expired");
      }

      email = payload.email || "";
      full_name = payload.name || payload.email || "Google User";

      if (!email) {
        throw new ForbiddenException("Google token does not contain email");
      }

      // Check if email is verified by Google
      if (!payload.email_verified) {
        throw new ForbiddenException("Google email is not verified");
      }
    } catch (error) {
      console.error("Google token verification error:", error);
      throw new ForbiddenException("Invalid or expired Google ID token");
    }

    // Find or create user
    let user = await this.userRepository.findOne({ email });
    if (!user) {
      // Create a new user with RENTER role
      const randomPassword = (Math.random() + 1).toString(36).substring(2, 10);
      const newUser = new this.userRepository({
        email,
        password: await hashPassword(randomPassword), // Random password for OAuth users
        full_name,
        role: Role.RENTER,
        is_active: true,
        phone: "", // Can be updated by user later
      });
      await newUser.save();

      // Create associated renter profile
      const newRenter = new this.renterRepository({
        user_id: newUser._id,
        address: "",
        date_of_birth: null,
        risk_score: 0,
      });
      await newRenter.save();

      user = newUser;
    }

    // Check if account is active
    if (!user.is_active) {
      throw new ForbiddenException("Account is disabled");
    }

    // Build JWT payload similar to login flow
    let userPayload: BaseJwtUserPayload | RenterJwtUserPayload | StaffJwtUserPayload | AdminJwtUserPayload = {
      _id: user._id.toString(),
      email: user.email,
      full_name: user.full_name,
      role: user.role,
    };

    // Add role-specific fields
    switch (user.role) {
      case Role.RENTER: {
        const renter = await this.renterRepository.findOne({ user_id: user._id });
        if (renter) {
          userPayload = {
            ...userPayload,
            address: renter.address,
            date_of_birth: renter.date_of_birth,
            risk_score: renter.risk_score,
          } as RenterJwtUserPayload;
        }
        break;
      }

      case Role.STAFF: {
        const staff = await this.staffRepository.findOne({ user_id: user._id });
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

      case Role.ADMIN: {
        const admin = await this.adminRepository.findOne({ user_id: user._id });
        if (admin) {
          userPayload = {
            ...userPayload,
            title: admin.title,
            notes: admin.notes,
            hire_date: admin.hire_date,
          } as AdminJwtUserPayload;
        }
        break;
      }

      default:
        break;
    }

    return { data: this.generateToken(userPayload) };
  }
}
