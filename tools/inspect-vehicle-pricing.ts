import mongoose from "mongoose";
import * as dotenv from "dotenv";
import "tsconfig-paths/register";
import { Pricing, PricingSchema } from "../src/models/pricings.schema";
import { Vehicle, VehicleSchema } from "../src/models/vehicle.schema";

dotenv.config();

async function main() {
  const [vehicleIdArg, dateArg] = process.argv.slice(2);
  if (!vehicleIdArg) {
    console.error("Usage: pnpm ts-node tools/inspect-vehicle-pricing.ts <vehicle_id> [ISO_date]");
    process.exit(1);
  }
  const vehicleId = new mongoose.Types.ObjectId(vehicleIdArg);
  const effectiveAt = dateArg ? new Date(dateArg) : new Date();

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("MONGO_URI is not set in environment");
    process.exit(1);
  }
  await mongoose.connect(mongoUri);

  const VehicleModel = (mongoose.models[Vehicle.name] as mongoose.Model<Vehicle>) || mongoose.model<Vehicle>(Vehicle.name, VehicleSchema);
  const PricingModel = (mongoose.models[Pricing.name] as mongoose.Model<Pricing>) || mongoose.model<Pricing>(Pricing.name, PricingSchema);

  const vehicle = await VehicleModel.findById(vehicleId).lean();
  if (!vehicle) {
    console.error("Vehicle not found");
    process.exit(1);
  }

  const pricingAll = await PricingModel.find({ vehicle_id: vehicleId }).sort({ effective_from: -1 }).lean();
  const activePricing = pricingAll.find((p) => {
    const from = new Date(p.effective_from);
    const to = p.effective_to ? new Date(p.effective_to) : null;
    return from <= effectiveAt && (!to || to >= effectiveAt);
  });

  console.log("Vehicle:", { id: vehicle._id.toString(), make: vehicle.make, model: vehicle.model, model_year: vehicle.model_year });
  console.log("Effective at:", effectiveAt.toISOString());
  console.log(
    "All pricings (most recent first):",
    pricingAll.map((p) => ({
      id: p._id.toString(),
      price_per_day: p.price_per_day,
      price_per_hour: p.price_per_hour,
      deposit_amount: p.deposit_amount,
      effective_from: new Date(p.effective_from).toISOString(),
      effective_to: p.effective_to ? new Date(p.effective_to).toISOString() : null,
    })),
  );
  console.log("Active pricing:", activePricing || null);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
