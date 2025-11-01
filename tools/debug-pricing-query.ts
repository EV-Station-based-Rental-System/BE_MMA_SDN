import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config();

async function debugPricingQuery() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }
    await mongoose.connect(mongoUri);
    console.log("✓ Connected to MongoDB");

    const vehicleId = "6905e6203fbf5ee8d0f8bf48";
    const pricingDate = new Date("2025-10-20T10:00:00.000Z");

    console.log("\n=== Query Parameters ===");
    console.log("Vehicle ID:", vehicleId);
    console.log("Pricing Date:", pricingDate);
    console.log("Pricing Date ISO:", pricingDate.toISOString());

    // Get all pricing records for this vehicle
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Database connection not established");
    }
    const allPricings = await db
      .collection("pricings")
      .find({ vehicle_id: new mongoose.Types.ObjectId(vehicleId) })
      .toArray();

    console.log("\n=== All Pricing Records ===");
    console.log(JSON.stringify(allPricings, null, 2));

    // Test the aggregation pipeline
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
                      { $lte: ["$$price.effective_from", pricingDate] },
                      {
                        $or: [{ $eq: ["$$price.effective_to", null] }, { $gte: ["$$price.effective_to", pricingDate] }],
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

    console.log("\n=== Running Aggregation Pipeline ===");
    const result = await db.collection("vehicles").aggregate(pipeline).toArray();

    console.log("\n=== Aggregation Result ===");
    console.log(JSON.stringify(result, null, 2));

    if (result[0]) {
      console.log("\n=== Selected Pricing ===");
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const vehicleData: any = result[0];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      console.log(JSON.stringify(vehicleData.pricing, null, 2));
    }

    await mongoose.connection.close();
    console.log("\n✓ Connection closed");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

void debugPricingQuery();
