import { connect, connection, Types } from "mongoose";
import * as fs from "fs";
import * as path from "path";

/**
 * Script to import test data from JSON files into MongoDB
 */
async function importTestData() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/mma_sdn";
    await connect(mongoUri);
    console.log("Connected to MongoDB:", mongoUri, "\n");

    const db = connection.db;
    if (!db) {
      throw new Error("Database connection not established");
    }

    // Read test data files
    const vehiclesPath = path.join(__dirname, "..", "test.vehicles.json");
    const pricingsPath = path.join(__dirname, "..", "test.pricings.json");

    console.log("Reading test data files...");
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const vehiclesData = JSON.parse(fs.readFileSync(vehiclesPath, "utf8"));
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const pricingsData = JSON.parse(fs.readFileSync(pricingsPath, "utf8"));

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    console.log(`Found ${vehiclesData.length} vehicles and ${pricingsData.length} pricings\n`);

    // Convert MongoDB Extended JSON to regular objects
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
    const vehicles = vehiclesData.map((v: any) => ({
      ...v,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      _id: new Types.ObjectId(v._id.$oid),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      station_id: v.station_id?.$oid ? new Types.ObjectId(v.station_id.$oid) : undefined,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      created_at: v.created_at?.$date ? new Date(v.created_at.$date) : new Date(),
    }));

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
    const pricings = pricingsData.map((p: any) => ({
      ...p,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      _id: new Types.ObjectId(p._id.$oid),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      vehicle_id: new Types.ObjectId(p.vehicle_id.$oid),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      effective_from: p.effective_from?.$date ? new Date(p.effective_from.$date) : new Date(),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      effective_to: p.effective_to?.$date ? new Date(p.effective_to.$date) : undefined,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      created_at: p.created_at?.$date ? new Date(p.created_at.$date) : new Date(),
    }));

    // Import vehicles
    console.log("=== Importing Vehicles ===");
    const vehiclesCollection = db.collection("vehicles");
    await vehiclesCollection.deleteMany({}); // Clear existing data
    const vehiclesResult = await vehiclesCollection.insertMany(vehicles);
    console.log(`✓ Imported ${vehiclesResult.insertedCount} vehicles`);

    // Import pricings
    console.log("\n=== Importing Pricings ===");
    const pricingsCollection = db.collection("pricings");
    await pricingsCollection.deleteMany({}); // Clear existing data
    const pricingsResult = await pricingsCollection.insertMany(pricings);
    console.log(`✓ Imported ${pricingsResult.insertedCount} pricings`);

    // Verify the import
    console.log("\n=== Verification ===");
    const vehicleCount = await vehiclesCollection.countDocuments();
    const pricingCount = await pricingsCollection.countDocuments();
    console.log(`Total vehicles in database: ${vehicleCount}`);
    console.log(`Total pricings in database: ${pricingCount}`);

    // Test the specific vehicle
    const testVehicleId = "6905e6203fbf5ee8d0f8bf48";
    const testVehicle = await vehiclesCollection.findOne({ _id: new Types.ObjectId(testVehicleId) });
    if (testVehicle) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      console.log(`\n✓ Test vehicle found: ${testVehicle.make} ${testVehicle.model}`);

      const testPricing = await pricingsCollection.findOne({ vehicle_id: new Types.ObjectId(testVehicleId) });
      if (testPricing) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        console.log(`✓ Test pricing found: deposit=${testPricing.deposit_amount}, price_per_day=${testPricing.price_per_day}`);
      } else {
        console.log(`✗ No pricing found for test vehicle`);
      }
    } else {
      console.log(`\n✗ Test vehicle NOT found`);
    }

    await connection.close();
    console.log("\n✅ Import completed successfully");
  } catch (error) {
    console.error("❌ Import failed:", error);
    process.exit(1);
  }
}

// Run the import
void importTestData();
