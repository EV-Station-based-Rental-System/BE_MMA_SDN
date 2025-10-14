import { FilterField } from "src/common/utils/type";

export const VehicleAtStationFieldMapping: Record<string, FilterField> = {
  searchCar: {
    field: "searchCar",
    type: "string",
    customWhere: (value: string) => {
      const regex = new RegExp(value, "i");
      return [
        { "vehicle.make": regex },
        { "vehicle.model": regex },
      ];
    },
  },
  model_year: {
    field: "vehicle.model_year",
    type: "number"
  },
  searchStation: {
    field: "searchStation",
    type: "string",
    customWhere(value: string) {
      const regex = new RegExp(value, "i");
      return [{ "station.name": regex }];
    }
  }
}
