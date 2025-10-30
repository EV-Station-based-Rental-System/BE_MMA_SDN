import { FilterField } from "src/common/utils/type";

export const BookingFieldMapping: Record<string, FilterField> = {
  search: {
    field: "search",
    type: "string",
    customWhere: (value: string) => {
      const regex = new RegExp(value, "i");
      return [
        { "renter.full_name": regex },
        { "renter.user.email": regex },
        { "renter.user.full_name": regex },
        { "verified_by_staff.user.full_name": regex },
      ];
    },
  },

  from_date: {
    field: "created_at",
    type: "date",
    customWhere: (value: string) => [{ created_at: { $gte: new Date(value) } }],
  },

  to_date: {
    field: "created_at",
    type: "date",
    customWhere: (value: string) => [{ created_at: { $lte: new Date(value) } }],
  },

  statusBooking: {
    field: "status",
    type: "string",
  },

  statusConfirm: {
    field: "verification_status",
    type: "string",
  },

  method: {
    field: "payments.method",
    type: "string",
  },
};
