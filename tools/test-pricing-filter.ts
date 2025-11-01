import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config();

async function testPricingFilter() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }
    await mongoose.connect(mongoUri);
    console.log("✓ Connected to MongoDB");

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Database connection not established");
    }

    const vehicleId = new mongoose.Types.ObjectId("6905e6203fbf5ee8d0f8bf48");
    const currentDate = new Date("2025-10-20T10:00:00.000Z");

    console.log("\n=== Test Parameters ===");
    console.log("Vehicle ID:", vehicleId);
    console.log("Current Date:", currentDate);
    console.log("Current Date type:", typeof currentDate);
    console.log("Current Date ISO:", currentDate.toISOString());

    // Get the pricing record directly
    const pricing = await db.collection("pricings").findOne({ vehicle_id: vehicleId });
    console.log("\n=== Pricing Record ===");
    console.log(JSON.stringify(pricing, null, 2));

    if (pricing) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const effectiveFrom = pricing.effective_from;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const effectiveTo = pricing.effective_to;

      console.log("\n=== Date Comparison Tests ===");
      console.log("effectiveFrom:", effectiveFrom);
      console.log("effectiveFrom type:", typeof effectiveFrom);
      console.log("effectiveFrom instanceof Date:", effectiveFrom instanceof Date);

      console.log("\neffectiveTo:", effectiveTo);
      console.log("effectiveTo type:", typeof effectiveTo);

      // Test the comparison manually
      if (effectiveFrom instanceof Date) {
        console.log("\n=== Manual Comparison ===");
        console.log("effectiveFrom <= currentDate:", effectiveFrom <= currentDate);
        console.log("effectiveTo === null:", effectiveTo === null);
        console.log("effectiveTo === undefined:", effectiveTo === undefined);
        console.log("!effectiveTo:", !effectiveTo);
      }

      // Test with simple filter
      console.log("\n=== Testing Simple Query ===");
      const simpleResult = await db.collection("pricings").findOne({
        vehicle_id: vehicleId,
        effective_from: { $lte: currentDate },
      });
      console.log("Simple query result:", simpleResult ? "FOUND" : "NOT FOUND");

      // Test with full filter
      const fullResult = await db.collection("pricings").findOne({
        vehicle_id: vehicleId,
        effective_from: { $lte: currentDate },
        $or: [{ effective_to: null }, { effective_to: { $gte: currentDate } }],
      });
      console.log("Full query result:", fullResult ? "FOUND" : "NOT FOUND");

      // Debug: check if effective_to field exists
      const checkEffectiveTo = await db.collection("pricings").findOne({
        vehicle_id: vehicleId,
        effective_to: { $exists: false },
      });
      console.log("\neffective_to field does NOT exist:", checkEffectiveTo ? "YES" : "NO");

      const checkEffectiveToNull = await db.collection("pricings").findOne({
        vehicle_id: vehicleId,
        effective_to: null,
      });
      console.log("effective_to is null:", checkEffectiveToNull ? "YES" : "NO");
    }

    await mongoose.connection.close();
    console.log("\n✓ Connection closed");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

void testPricingFilter();
