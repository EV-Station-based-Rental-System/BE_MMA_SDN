import { connect, connection } from "mongoose";

/**
 * Quick database inspection script
 */
async function inspectDatabase() {
  try {
    //Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/mma_sdn";
    await connect(mongoUri);
    console.log("Connected to MongoDB:", mongoUri, "\n");

    const db = connection.db;
    if (!db) {
      throw new Error("Database connection not established");
    }

    console.log("=== Checking Vehicles Collection ===");
    const vehiclesCollection = db.collection("vehicles");
    const vehicleCount = await vehiclesCollection.countDocuments();
    console.log("Total vehicles:", vehicleCount);

    const sampleVehicles = await vehiclesCollection.find({}).limit(3).toArray();
    console.log("\nSample vehicles:");
    sampleVehicles.forEach((v, idx) => {
      console.log(`\n${idx + 1}. ${v.make} ${v.model}`);
      console.log("   _id:", v._id);
      console.log("   station_id:", v.station_id);
    });

    console.log("\n=== Checking Pricings Collection ===");
    const pricingsCollection = db.collection("pricings");
    const pricingCount = await pricingsCollection.countDocuments();
    console.log("Total pricings:", pricingCount);

    const samplePricings = await pricingsCollection.find({}).limit(3).toArray();
    console.log("\nSample pricings:");
    samplePricings.forEach((p, idx) => {
      console.log(`\n${idx + 1}. Pricing ID: ${p._id}`);
      console.log("   vehicle_id:", p.vehicle_id, "(type:", typeof p.vehicle_id, ")");
      console.log("   deposit_amount:", p.deposit_amount);
      console.log("   price_per_day:", p.price_per_day);
    });

    await connection.close();
    console.log("\n\nDatabase connection closed");
  } catch (error) {
    console.error("Inspection failed:", error);
    process.exit(1);
  }
}

// Run the inspection
void inspectDatabase();
