import { Admin } from "src/models/admin.schema";
import { Renter } from "src/models/renter.schema";
import { Staff } from "src/models/staff.schema";
import { User } from "src/models/user.schema";
import { Kycs } from "src/models/kycs.schema";
import { Types } from "mongoose";
import { ApiProperty } from "@nestjs/swagger";

export class UserWithRoleExtra extends User {
  @ApiProperty({
    oneOf: [{ $ref: "#/components/schemas/Renter" }, { $ref: "#/components/schemas/Staff" }, { $ref: "#/components/schemas/Admin" }],
    description: "Role-specific extra information (Renter, Staff, or Admin)",
    required: false,
    nullable: true,
  })
  roleExtra?: Staff | Renter | Admin | null;

  @ApiProperty({
    type: () => Kycs,
    description: "KYC information (only populated for renters if exists)",
    required: false,
    nullable: true,
  })
  kycs?: Kycs | null;
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
