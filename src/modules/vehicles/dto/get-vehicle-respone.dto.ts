import { Vehicle } from "src/models/vehicle.schema";
import { Pricing } from "src/models/pricings.schema";
import { Station } from "src/models/station.schema";

export class VehicleWithPricingAndStation extends Vehicle {
  station?: Station;
  pricing?: Pricing;
}
