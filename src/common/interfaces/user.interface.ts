import { Admin } from "src/models/admin.schema";
import { Renter } from "src/models/renter.schema";
import { Staff } from "src/models/staff.schema";
import { User } from "src/models/user.schema";

export interface UserWithRoleExtra extends User {
  roleExtra?: Staff | Renter | Admin | null;
}
