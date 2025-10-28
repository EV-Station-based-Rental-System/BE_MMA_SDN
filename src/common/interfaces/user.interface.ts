import { Admin } from "src/models/admin.schema";
import { Renter } from "src/models/renter.schema";
import { Staff } from "src/models/staff.schema";
import { User } from "src/models/user.schema";
import { Types } from "mongoose";

export interface UserWithRoleExtra extends User {
  roleExtra?: Staff | Renter | Admin | null;
}

export interface UserWithRenterRole extends User {
  roleExtra: Renter & { _id: Types.ObjectId };
}

export interface UserWithStaffRole extends User {
  roleExtra: Staff & { _id: Types.ObjectId };
}

export interface UserWithAdminRole extends User {
  roleExtra: Admin & { _id: Types.ObjectId };
}
