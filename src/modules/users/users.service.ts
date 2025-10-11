import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Role } from 'src/common/enums/role.enum';
import { Admin } from 'src/models/admin.schema';
import { Booking } from 'src/models/booking.schema';
import { Renter } from 'src/models/renter.schema';
import { Staff } from 'src/models/staff.schema';
import { User } from 'src/models/user.schema';
import { UpdateStaffDto } from './dto/staff.dto';
import { UpdateRenterDto } from './dto/renter.dto';
import { UserWithRoleExtra } from 'src/common/interfaces/user.interface';
import { ConflictException } from 'src/common/exceptions/conflict.exception';
import { NotFoundException } from 'src/common/exceptions/not-found.exception';
import { UserPaginationDto } from 'src/common/pagination/dto/user/user-pagination.dto';
import { UserFieldMapping } from 'src/common/pagination/filters/user-field-mapping';
import { buildPaginationResponse } from 'src/common/pagination/pagination-response';
import { applyCommonFiltersMongo } from 'src/common/pagination/applyCommonFilters';
import { applyPaginationMongo } from 'src/common/pagination/applyPagination';
import { applySortingMongo } from 'src/common/pagination/applySorting';
import { applyFacetMongo } from 'src/common/pagination/applyFacetMongo';
import { FacetResult } from 'src/common/utils/type';


@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userRepository: Model<User>,
    @InjectModel(Staff.name) private staffRepository: Model<Staff>,
    @InjectModel(Admin.name) private adminRepository: Model<Admin>,
    @InjectModel(Renter.name) private renterRepository: Model<Renter>,
    @InjectModel(Booking.name) private bookingRepository: Model<Booking>,
  ) { }

  async findAll(filters: UserPaginationDto): Promise<ReturnType<typeof buildPaginationResponse>> {
    const pipeline: any[] = [];


    applyCommonFiltersMongo(pipeline, filters, UserFieldMapping);


    pipeline.push(
      {
        $lookup: {
          from: this.staffRepository.collection.name,
          localField: '_id',
          foreignField: 'user_id',
          as: 'staff',
        },
      },
      {
        $lookup: {
          from: this.renterRepository.collection.name,
          localField: '_id',
          foreignField: 'user_id',
          as: 'renter',
        },
      },
      {
        $lookup: {
          from: this.adminRepository.collection.name,
          localField: '_id',
          foreignField: 'user_id',
          as: 'admin',
        },
      },
      {
        $addFields: {
          roleExtra: {
            $switch: {
              branches: [
                { case: { $eq: ['$role', 'staff'] }, then: { $arrayElemAt: ['$staff', 0] } },
                { case: { $eq: ['$role', 'renter'] }, then: { $arrayElemAt: ['$renter', 0] } },
                { case: { $eq: ['$role', 'admin'] }, then: { $arrayElemAt: ['$admin', 0] } },
              ],
              default: null,
            },
          },
        },
      },
      { $project: { staff: 0, renter: 0, admin: 0 } }
    );


    const allowedSortFields = ['full_name', 'email', 'phone', 'created_at'];
    applySortingMongo(pipeline, filters.sortBy, filters.sortOrder, allowedSortFields, 'created_at');
    applyPaginationMongo(pipeline, { page: filters.page, take: filters.take });


    applyFacetMongo(pipeline);


    const result = await this.userRepository.aggregate(pipeline) as FacetResult<UserWithRoleExtra>;
    const users = result[0]?.data || [];
    const total = result[0]?.meta?.[0]?.total || 0;

    return buildPaginationResponse(users, {
      page: filters.page,
      take: filters.take,
      total,
    });
  }





  async findOne(id: string): Promise<UserWithRoleExtra> {
    const users = await this.userRepository.aggregate<UserWithRoleExtra>([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $lookup: { from: this.staffRepository.collection.name, localField: '_id', foreignField: 'user_id', as: 'staff' },
      },
      {
        $lookup: { from: this.renterRepository.collection.name, localField: '_id', foreignField: 'user_id', as: 'renter' },
      },
      {
        $lookup: { from: this.adminRepository.collection.name, localField: '_id', foreignField: 'user_id', as: 'admin' },
      },
      {
        $addFields: {
          fieldExtras: {
            $switch: {
              branches: [
                { case: { $eq: ['$role', 'staff'] }, then: { $arrayElemAt: ['$staff', 0] } },
                { case: { $eq: ['$role', 'renter'] }, then: { $arrayElemAt: ['$renter', 0] } },
                { case: { $eq: ['$role', 'admin'] }, then: { $arrayElemAt: ['$admin', 0] } },
              ],
              default: null,
            },
          },
        },
      },
      { $project: { staff: 0, renter: 0, admin: 0 } },
    ]);

    if (users.length === 0) throw new NotFoundException('User not found');
    return users[0];
  }



  async updateRenter(id: string, updateRenterDto: UpdateRenterDto): Promise<UserWithRoleExtra> {
    const user = await this.userRepository.findByIdAndUpdate(
      id,
      { full_name: updateRenterDto.full_name, phone: updateRenterDto.phone },
      { new: true },
    );
    if (!user) throw new NotFoundException('User not found');
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
    return user as UserWithRoleExtra;
  }

  async updateStaff(id: string, updateStaffDto: UpdateStaffDto): Promise<UserWithRoleExtra | null> {

    const user = await this.userRepository.findByIdAndUpdate(
      id,
      { full_name: updateStaffDto.full_name, phone: updateStaffDto.phone },
      { new: true },
    );
    if (!user) throw new NotFoundException('User not found');
    const objectId = new mongoose.Types.ObjectId(id);

    const staff = await this.staffRepository.findOneAndUpdate(
      { user_id: objectId },
      { position: updateStaffDto.position },
      { new: true, upsert: true },
    );
    (user as UserWithRoleExtra).roleExtra = staff;
    return user as UserWithRoleExtra;
  }





  private async checkUser(id: string): Promise<boolean> {
    const count = await this.bookingRepository.countDocuments({ user_id: id });
    return count > 0;
  }

  async softDelete(id: string): Promise<{ msg: string }> {
    await this.userRepository.findByIdAndUpdate(
      id,
      { is_active: false },
      { new: true },
    );

    return { msg: 'User soft-deleted successfully' };
  }
  async restoreStatus(id: string): Promise<{ msg: string }> {
    await this.userRepository.findByIdAndUpdate(
      id,
      { is_active: true },
      { new: true },
    );
    return { msg: 'User restored successfully' };
  }

  async hashDelete(id: string): Promise<{ msg: string }> {
    const checkBooking = await this.checkUser(id);
    if (checkBooking) {
      throw new ConflictException('Cannot delete user with existing bookings');
    }
    const user = await this.userRepository.findById(id);
    if (!user) return { msg: 'User not found' };


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
    return { msg: 'User hard-deleted successfully' };
  }

}
