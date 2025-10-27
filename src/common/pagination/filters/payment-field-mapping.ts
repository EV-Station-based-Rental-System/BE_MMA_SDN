import { FilterField } from "src/common/utils/type";

export const PaymentFieldMapping: Record<string, FilterField> = {
  status: {
    field: "status",
    type: "string",
  },
  method: {
    field: "method",
    type: "string",
  },
  transaction_code: {
    field: "transaction_code",
    type: "string",
  },
};
