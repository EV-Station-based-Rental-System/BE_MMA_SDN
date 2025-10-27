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
import { applyPaginationMongo } from "src/common/pagination/applyPagination";
import { applySortingMongo } from "src/common/pagination/applySorting";
import { applyFacetMongo } from "src/common/pagination/applyFacetMongo";
import { FacetResult } from "src/common/utils/type";
import { ResponseList } from "src/common/response/response-list";
import { ResponseDetail } from "src/common/response/response-detail-create-update";
import { ResponseMsg } from "src/common/response/response-message";
import { StaffPaginationDto } from "src/common/pagination/dto/staff/staff-pagination";

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userRepository: Model<User>,
    @InjectModel(Staff.name) private staffRepository: Model<Staff>,
    @InjectModel(Admin.name) private adminRepository: Model<Admin>,
    @InjectModel(Renter.name) private renterRepository: Model<Renter>,
    @InjectModel(Booking.name) private bookingRepository: Model<Booking>,
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
          roleExtra: { $arrayElemAt: ["$renter", 0] },
        },
      },
      { $project: { renter: 0 } },
    );

    applyCommonFiltersMongo(pipeline, filters, UserFieldMapping);
    const allowedSortFields = ["full_name", "email", "phone", "created_at"];
    applySortingMongo(pipeline, filters.sortBy, filters.sortOrder, allowedSortFields, "created_at");
    applyPaginationMongo(pipeline, { page: filters.page, take: filters.take });
    applyFacetMongo(pipeline);

    const result = (await this.userRepository.aggregate(pipeline)) as FacetResult<UserWithRoleExtra>;
    const users = result[0]?.data || [];
    const total = result[0]?.meta?.[0]?.total || 0;

    return ResponseList.ok(buildPaginationResponse(users, { total, page: filters.page, take: filters.take }));
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
    applyPaginationMongo(pipeline, { page: filters.page, take: filters.take });
    applyFacetMongo(pipeline);

    const result = (await this.userRepository.aggregate(pipeline)) as FacetResult<UserWithRoleExtra>;
    const users = result[0]?.data || [];
    const total = result[0]?.meta?.[0]?.total || 0;

    return ResponseList.ok(buildPaginationResponse(users, { total, page: filters.page, take: filters.take }));
  }

  async findOne(id: string): Promise<ResponseDetail<UserWithRoleExtra>> {
    const users = await this.userRepository.aggregate<UserWithRoleExtra>([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: this.staffRepository.collection.name,
          localField: "_id",
          foreignField: "user_id",
          as: "staff",
        },
      },
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
          roleExtra: {
            $switch: {
              branches: [
                { case: { $eq: ["$role", "staff"] }, then: { $arrayElemAt: ["$staff", 0] } },
                { case: { $eq: ["$role", "renter"] }, then: { $arrayElemAt: ["$renter", 0] } },
              ],
              default: null,
            },
          },
        },
      },
      { $project: { staff: 0, renter: 0, admin: 0 } },
    ]);

    if (users.length === 0) throw new NotFoundException("User not found");
    return ResponseDetail.ok(users[0]);
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
        driver_license_no: updateRenterDto.driver_license_no,
        address: updateRenterDto.address,
        date_of_birth: updateRenterDto.date_of_birth,
      },
      { new: true, upsert: true },
    );

    (user as UserWithRoleExtra).roleExtra = renter;
    return ResponseDetail.ok(user as UserWithRoleExtra);
  }

  async updateStaff(id: string, updateStaffDto: UpdateStaffDto): Promise<ResponseDetail<UserWithRoleExtra> | null> {
    const user = await this.userRepository.findByIdAndUpdate(id, { full_name: updateStaffDto.full_name, phone: updateStaffDto.phone }, { new: true });
    if (!user) throw new NotFoundException("User not found");

    const objectId = new mongoose.Types.ObjectId(id);
    const staff = await this.staffRepository.findOneAndUpdate(
      { user_id: objectId },
      { position: updateStaffDto.position },
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
