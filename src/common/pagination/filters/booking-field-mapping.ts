import { FilterField } from "src/common/utils/type";

export const BookingFieldMapping: Record<string, FilterField> = {
  status: {
    field: "status",
    type: "string",
  },
  verification_status: {
    field: "verification_status",
    type: "string",
  },
  cancel_reason: {
    field: "cancel_reason",
    type: "string",
  },
};
