import { FilterField } from "src/common/utils/type";

export const VehicleFieldMapping: Record<string, FilterField> = {
  // make, model, status
  search: {
    field: "search",
    type: "string",
    customWhere: (value: string) => {
      const regex = new RegExp(value, "i");
      return [{ make: regex }, { model: regex }, { status: regex }];
    },
  },
  model_year: {
    field: "model_year",
    type: "number",
  },
  is_active: {
    field: "is_active",
    type: "boolean",
  },
  status: {
    field: "status",
    type: "string",
  },
};
