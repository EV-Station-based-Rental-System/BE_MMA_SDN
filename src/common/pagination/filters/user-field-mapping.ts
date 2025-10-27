import { FilterField } from "src/common/utils/type";

export const UserFieldMapping: Record<string, FilterField> = {
  search: {
    field: "search",
    type: "string",
    customWhere: (value: string) => {
      const regex = new RegExp(value, "i");
      return [{ email: regex }, { full_name: regex }, { phone: regex }];
    },
  },
  is_active: {
    field: "is_active",
    type: "boolean",
  },
};
