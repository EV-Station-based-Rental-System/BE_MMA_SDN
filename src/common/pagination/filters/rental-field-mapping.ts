import { FilterField } from "src/common/utils/type";

export const RentalFieldMapping: Record<string, FilterField> = {
  search: {
    field: "search",
    type: "string",
    customWhere: (value: string) => {
      const regex = new RegExp(value, "i");
      return [{ "booking.renter.user.full_name": regex }, { "booking.renter.user.email": regex }];
    },
  },
  status: {
    field: "status",
    type: "string",
  },
  from_date: {
    field: "pickup_datetime",
    type: "date",
    customWhere: (value: string) => [{ pickup_datetime: { $gte: new Date(value) } }],
  },
  to_date: {
    field: "pickup_datetime",
    type: "date",
    customWhere: (value: string) => [{ pickup_datetime: { $lte: new Date(value) } }],
  },
};
