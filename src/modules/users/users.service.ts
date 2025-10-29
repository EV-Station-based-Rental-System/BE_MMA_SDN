import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Model } from "mongoose";
import { Role } from "src/common/enums/role.enum";
import { Admin } from "src/models/admin.schema";
import { Booking } from "src/models/booking.schema";
import { Renter } from "src/models/renter.schema";
import { Staff } from "src/models/staff.schema";
import { User } from "src/models/user.schema";
import { UpdateStaffDto } from "./dto/staff.dto";
import { UpdateRenterDto } from "./dto/renter.dto";
import { UserWithRoleExtra } from "src/common/interfaces/user.interface";
import { ConflictException } from "src/common/exceptions/conflict.exception";
import { NotFoundException } from "src/common/exceptions/not-found.exception";
import { UserPaginationDto } from "src/common/pagination/dto/user/user-pagination.dto";
import { UserFieldMapping } from "src/common/pagination/filters/user-field-mapping";
import { buildPaginationResponse } from "src/common/pagination/pagination-response";
import { applyCommonFiltersMongo } from "src/common/pagination/applyCommonFilters";
import { applySortingMongo } from "src/common/pagination/applySorting";
import { ResponseList } from "src/common/response/response-list";
import { ResponseDetail } from "src/common/response/response-detail-create-update";
import { ResponseMsg } from "src/common/response/response-message";
import { StaffPaginationDto } from "src/common/pagination/dto/staff/staff-pagination";
import { Station } from "src/models/station.schema";
import { Kycs } from "src/models/kycs.schema";

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userRepository: Model<User>,
    @InjectModel(Staff.name) private staffRepository: Model<Staff>,
    @InjectModel(Admin.name) private adminRepository: Model<Admin>,
    @InjectModel(Renter.name) private renterRepository: Model<Renter>,
    @InjectModel(Booking.name) private bookingRepository: Model<Booking>,
    @InjectModel(Station.name) private stationRepository: Model<Station>,
    @InjectModel(Kycs.name) private kycsRepository: Model<Kycs>,
  ) {}

  async findAllUser(filters: UserPaginationDto): Promise<ResponseList<UserWithRoleExtra>> {
    const pipeline: any[] = [];

    // Only get renter users
    pipeline.push(
      { $match: { role: "renter" } },
      {
        $lookup: {
          from: this.renterRepository.collection.name,
          localField: "_id",
          foreignField: "user_id",
          as: "renter",
        },
      },
      {
        $addFields: {
          renter: { $arrayElemAt: ["$renter", 0] },
        },
      },
      {
        $lookup: {
          from: this.kycsRepository.collection.name,
          localField: "renter._id",
          foreignField: "renter_id",
          as: "kycs",
        },
      },
      {
        $addFields: {
          roleExtra: "$renter",
          kycs: { $arrayElemAt: ["$kycs", 0] },
        },
      },
      { $project: { renter: 0 } },
    );

    // apply filters (this will push $match / $addFields / $project etc)
    applyCommonFiltersMongo(pipeline, filters, UserFieldMapping);

    // sorting - apply before facet so both branches are consistent (data uses sort; meta doesn't need sort but no harm)
    const allowedSortFields = ["full_name", "email", "phone", "created_at"];
    applySortingMongo(pipeline, filters.sortBy, filters.sortOrder, allowedSortFields, "created_at");

    // Build facet manually to ensure meta.total is counted BEFORE pagination
    const page = Math.max(1, Number(filters.page) || 1);
    const take = Math.max(1, Number(filters.take) || 10);
    const skip = (page - 1) * take;

    pipeline.push({
      $facet: {
        data: [
          // apply sort again in data branch to be explicit (applySortingMongo already pushed $sort; repetition is safe but you can remove one)
          // { $sort: ... } // if applySortingMongo already added $sort, not needed here
          { $skip: skip },
          { $limit: take },
        ],
        meta: [{ $count: "total" }],
      },
    });

    // After facet, transform result to expected shape
    const result = await this.userRepository.aggregate(pipeline);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const facet = result[0] || { data: [], meta: [] };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const users = facet.data || [];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const total = facet.meta && facet.meta[0] && facet.meta[0].total ? facet.meta[0].total : 0;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment
    return ResponseList.ok(buildPaginationResponse(users, { total, page, take }));
  }

  async findAllStaff(filters: StaffPaginationDto): Promise<ResponseList<UserWithRoleExtra>> {
    const pipeline: any[] = [
      { $match: { role: "staff" } },
      {
        $lookup: {
          from: this.staffRepository.collection.name,
          localField: "_id",
          foreignField: "user_id",
          as: "staff",
        },
      },
      {
        $addFields: {
          roleExtra: { $arrayElemAt: ["$staff", 0] },
        },
      },
      { $project: { staff: 0 } },
    ];

    applyCommonFiltersMongo(pipeline, filters, UserFieldMapping);

    const allowedSortFields = ["full_name", "email", "phone", "created_at"];
    applySortingMongo(pipeline, filters.sortBy, filters.sortOrder, allowedSortFields, "created_at");

    const page = Math.max(1, Number(filters.page) || 1);
    const take = Math.max(1, Number(filters.take) || 10);
    const skip = (page - 1) * take;

    pipeline.push({
      $facet: {
        data: [{ $skip: skip }, { $limit: take }],
        meta: [{ $count: "total" }],
      },
    });

    const result = await this.userRepository.aggregate(pipeline);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const facet = result[0] || { data: [], meta: [] };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const users = facet.data || [];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const total = facet.meta && facet.meta[0] && facet.meta[0].total ? facet.meta[0].total : 0;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment
    return ResponseList.ok(buildPaginationResponse(users, { total, page, take }));
  }

  private async findOneRenter(id: string): Promise<ResponseDetail<UserWithRoleExtra>> {
    const users = await this.userRepository.aggregate<UserWithRoleExtra>([
      { $match: { _id: new mongoose.Types.ObjectId(id), role: "renter" } },
      {
        $lookup: {
          from: this.renterRepository.collection.name,
          localField: "_id",
          foreignField: "user_id",
          as: "renter",
        },
      },
      {
        $lookup: {
          from: this.kycsRepository.collection.name,
          localField: "renter._id",
          foreignField: "renter_id",
          as: "kycs",
        },
      },
      {
        $addFields: {
          roleExtra: { $arrayElemAt: ["$renter", 0] },
          kycs: { $arrayElemAt: ["$kycs", 0] },
        },
      },
      { $project: { renter: 0 } },
    ]);

    if (users.length === 0) throw new NotFoundException("Renter not found");
    return ResponseDetail.ok(users[0]);
  }

  private async findOneStaff(id: string): Promise<ResponseDetail<UserWithRoleExtra>> {
    const users = await this.userRepository.aggregate<UserWithRoleExtra>([
      { $match: { _id: new mongoose.Types.ObjectId(id), role: "staff" } },
      {
        $lookup: {
          from: this.staffRepository.collection.name,
          localField: "_id",
          foreignField: "user_id",
          as: "staff",
        },
      },
      {
        $addFields: {
          roleExtra: { $arrayElemAt: ["$staff", 0] },
        },
      },
      { $project: { staff: 0 } },
    ]);

    if (users.length === 0) throw new NotFoundException("Staff not found");
    return ResponseDetail.ok(users[0]);
  }
  private async findOneAdmin(id: string): Promise<ResponseDetail<UserWithRoleExtra>> {
    const users = await this.userRepository.aggregate<UserWithRoleExtra>([
      { $match: { _id: new mongoose.Types.ObjectId(id), role: "admin" } },
      {
        $lookup: {
          from: this.adminRepository.collection.name,
          localField: "_id",
          foreignField: "user_id",
          as: "admin",
        },
      },
      {
        $addFields: {
          roleExtra: { $arrayElemAt: ["$admin", 0] },
        },
      },
      { $project: { admin: 0 } },
    ]);

    if (users.length === 0) throw new NotFoundException("Admin not found");
    return ResponseDetail.ok(users[0]);
  }

  async findOne(id: string): Promise<ResponseDetail<UserWithRoleExtra>> {
    const baseUser = await this.userRepository.findById(id);
    if (!baseUser) throw new NotFoundException("User not found");

    switch (baseUser.role) {
      case Role.RENTER:
        return this.findOneRenter(id);
      case Role.STAFF:
        return this.findOneStaff(id);
      case Role.ADMIN:
        return this.findOneAdmin(id);
      default:
        throw new NotFoundException("Unsupported role");
    }
  }

  async updateRenter(id: string, updateRenterDto: UpdateRenterDto): Promise<ResponseDetail<UserWithRoleExtra | null>> {
    const user = await this.userRepository.findByIdAndUpdate(
      id,
      { full_name: updateRenterDto.full_name, phone: updateRenterDto.phone },
      { new: true },
    );
    if (!user) throw new NotFoundException("User not found");

    const objectId = new mongoose.Types.ObjectId(id);
    const renter = await this.renterRepository.findOneAndUpdate(
      { user_id: objectId },
      {
        address: updateRenterDto.address,
        date_of_birth: updateRenterDto.date_of_birth,
      },
      { new: true, upsert: true },
    );

    (user as UserWithRoleExtra).roleExtra = renter;
    return ResponseDetail.ok(user as UserWithRoleExtra);
  }

  async updateStaff(id: string, updateStaffDto: UpdateStaffDto): Promise<ResponseDetail<UserWithRoleExtra> | null> {
    // check station
    const checkStation = await this.stationRepository.findById(updateStaffDto.station_id);
    if (!checkStation) throw new NotFoundException("Station not found");

    const user = await this.userRepository.findByIdAndUpdate(id, { full_name: updateStaffDto.full_name, phone: updateStaffDto.phone }, { new: true });
    if (!user) throw new NotFoundException("User not found");

    const objectId = new mongoose.Types.ObjectId(id);

    const staff = await this.staffRepository.findOneAndUpdate(
      { user_id: objectId },
      { position: updateStaffDto.position, station_id: updateStaffDto.station_id },
      { new: true, upsert: true },
    );

    (user as UserWithRoleExtra).roleExtra = staff;
    return ResponseDetail.ok(user as UserWithRoleExtra);
  }

  private async checkUser(id: string): Promise<boolean> {
    const count = await this.bookingRepository.countDocuments({ user_id: id });
    return count > 0;
  }

  async softDelete(id: string): Promise<ResponseMsg> {
    await this.userRepository.findByIdAndUpdate(id, { is_active: false }, { new: true });
    return ResponseMsg.ok("User soft-deleted successfully");
  }

  async restoreStatus(id: string): Promise<ResponseMsg> {
    await this.userRepository.findByIdAndUpdate(id, { is_active: true }, { new: true });
    return ResponseMsg.ok("User restored successfully");
  }

  async hardDelete(id: string): Promise<ResponseMsg> {
    const checkBooking = await this.checkUser(id);
    if (checkBooking) {
      throw new ConflictException("Cannot delete user with existing bookings");
    }

    const user = await this.userRepository.findById(id);
    if (!user) return ResponseMsg.fail("User not found");

    switch (user.role) {
      case Role.STAFF:
        await this.staffRepository.deleteOne({ user_id: user._id });
        break;
      case Role.RENTER:
        await this.renterRepository.deleteOne({ user_id: user._id });
        break;
      case Role.ADMIN:
        await this.adminRepository.deleteOne({ user_id: user._id });
        break;
    }

    await this.userRepository.deleteOne({ _id: id });
    return ResponseMsg.ok("User hard-deleted successfully");
  }
}
