import { FilterField } from "src/common/utils/type";

export const StaffAtStationFieldMapping: Record<string, FilterField> = {
  searchStaff: {
    field: "searchStaff",
    type: "string",
    customWhere: (value: string) => {
      const regex = new RegExp(value, "i");
      return [{ "user.email": regex }, { "user.full_name": regex }, { "user.phone_number": regex }];
    },
  },
  searchStation: {
    field: "searchStation",
    type: "string",
    customWhere: (value: string) => {
      const regex = new RegExp(value, "i");
      return [{ "station.name": regex }];
    },
  },
  fromStartTime: {
    field: "start_time",
    type: "date",
    customWhere: (value: string) => {
      return [{ start_time: { $gte: new Date(value) } }];
    },
  },
  toEndTime: {
    field: "end_time",
    type: "date",
    customWhere: (value: string) => {
      return [{ end_time: { $lte: new Date(value) } }];
    },
  },
};
