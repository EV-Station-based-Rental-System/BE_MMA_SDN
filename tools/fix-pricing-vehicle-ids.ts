import { connect, connection, Types } from "mongoose";

/**
 * Migration script to fix pricing records that have vehicle_id stored as strings
 * instead of ObjectIds. This ensures the $lookup aggregation works correctly.
 */
async function fixPricingVehicleIds() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/mma_sdn";
    await connect(mongoUri);
    console.log("Connected to MongoDB");

    const db = connection.db;
    if (!db) {
      throw new Error("Database connection not established");
    }

    const pricingsCollection = db.collection("pricings");

    // Find all pricing records
    const pricings = await pricingsCollection.find({}).toArray();
    console.log(`Found ${pricings.length} pricing records`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const pricing of pricings) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const vehicleId = pricing.vehicle_id;

      // Check if vehicle_id is a string or not a proper ObjectId
      if (typeof vehicleId === "string") {
        try {
          const objectId = new Types.ObjectId(vehicleId);
          await pricingsCollection.updateOne({ _id: pricing._id }, { $set: { vehicle_id: objectId } });
          updatedCount++;
          console.log(`✓ Updated pricing ${String(pricing._id)}: vehicle_id "${vehicleId}" → ObjectId`);
        } catch (err) {
          console.error(`✗ Failed to convert vehicle_id "${vehicleId}" for pricing ${String(pricing._id)}:`, err);
        }
      } else if (vehicleId instanceof Types.ObjectId) {
        skippedCount++;
      } else {
        console.warn(`⚠ Unexpected vehicle_id type for pricing ${String(pricing._id)}:`, typeof vehicleId);
      }
    }

    console.log("\n=== Migration Summary ===");
    console.log(`Total records: ${pricings.length}`);
    console.log(`Updated: ${updatedCount}`);
    console.log(`Skipped (already ObjectId): ${skippedCount}`);
    console.log(`Failed: ${pricings.length - updatedCount - skippedCount}`);

    await connection.close();
    console.log("\nDatabase connection closed");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

// Run the migration
void fixPricingVehicleIds();
