import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config();

async function fixPricingDates() {
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

    // Get all pricing records
    const pricings = await db.collection("pricings").find({}).toArray();
    console.log(`\nFound ${pricings.length} pricing records`);

    let fixed = 0;
    for (const pricing of pricings) {
      const updates: any = {};

      // Check and convert effective_from
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (typeof pricing.effective_from === "string") {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
        updates.effective_from = new Date(pricing.effective_from);
      }

      // Check and convert effective_to
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (pricing.effective_to && typeof pricing.effective_to === "string") {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
        updates.effective_to = new Date(pricing.effective_to);
      }

      // Check and convert created_at
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (typeof pricing.created_at === "string") {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
        updates.created_at = new Date(pricing.created_at);
      }

      // Update if there are any fields to fix
      if (Object.keys(updates).length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        await db.collection("pricings").updateOne({ _id: pricing._id }, { $set: updates });
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        console.log(`Fixed pricing ${pricing._id.toString()}:`, Object.keys(updates));
        fixed++;
      }
    }

    console.log(`\n✓ Fixed ${fixed} pricing records`);

    // Verify the fix
    console.log("\n=== Verifying Fix ===");
    const vehicleId = "6905e6203fbf5ee8d0f8bf48";
    const testDate = new Date("2025-10-20T10:00:00.000Z");

    const verifyPricing = await db.collection("pricings").findOne({ vehicle_id: new mongoose.Types.ObjectId(vehicleId) });

    console.log("Sample pricing record:");
    console.log(JSON.stringify(verifyPricing, null, 2));
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    console.log("\neffective_from type:", typeof verifyPricing?.effective_from);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    console.log("effective_from value:", verifyPricing?.effective_from);

    // Test aggregation
    const pipeline = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(vehicleId),
        },
      },
      {
        $lookup: {
          from: "pricings",
          localField: "_id",
          foreignField: "vehicle_id",
          as: "pricing_all",
        },
      },
      {
        $addFields: {
          pricing: {
            $arrayElemAt: [
              {
                $filter: {
                  input: {
                    $sortArray: {
                      input: "$pricing_all",
                      sortBy: { effective_from: -1, created_at: -1 },
                    },
                  },
                  as: "price",
                  cond: {
                    $and: [
                      { $lte: ["$$price.effective_from", testDate] },
                      {
                        $or: [{ $eq: ["$$price.effective_to", null] }, { $gte: ["$$price.effective_to", testDate] }],
                      },
                    ],
                  },
                },
              },
              0,
            ],
          },
        },
      },
    ];

    const result = await db.collection("vehicles").aggregate(pipeline).toArray();

    console.log("\n=== Test Aggregation Result ===");
    if (result[0]) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const vehicleData: any = result[0];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      console.log("Pricing found:", vehicleData.pricing ? "YES" : "NO");
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (vehicleData.pricing) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        console.log(JSON.stringify(vehicleData.pricing, null, 2));
      }
    }

    await mongoose.connection.close();
    console.log("\n✓ Connection closed");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

void fixPricingDates();
