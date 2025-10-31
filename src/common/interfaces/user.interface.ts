import { Admin } from "src/models/admin.schema";
import { Renter } from "src/models/renter.schema";
import { Staff } from "src/models/staff.schema";
import { User } from "src/models/user.schema";
import { Types } from "mongoose";

export class UserWithRoleExtra extends User {
  roleExtra?: Staff | Renter | Admin | null;
}

export class UserWithRenterRole extends User {
  roleExtra: Renter & { _id: Types.ObjectId };
}

export class UserWithStaffRole extends User {
  roleExtra: Staff & { _id: Types.ObjectId };
}

export class UserWithAdminRole extends User {
  roleExtra: Admin & { _id: Types.ObjectId };
}
