import { connect, connection, Types } from "mongoose";

/**
 * Debug script to test the pricing aggregation pipeline
 */
async function testPricingAggregation() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/mma_sdn";
    await connect(mongoUri);
    console.log("Connected to MongoDB\n");

    const db = connection.db;
    if (!db) {
      throw new Error("Database connection not established");
    }

    const vehiclesCollection = db.collection("vehicles");
    const vehicleId = "6905e6203fbf5ee8d0f8bf48";
    const currentDate = new Date();

    console.log("Testing vehicle ID:", vehicleId);
    console.log("Current date:", currentDate);
    console.log("\n=== Step 1: Check if vehicle exists ===");

    const vehicle = await vehiclesCollection.findOne({ _id: new Types.ObjectId(vehicleId) });
    console.log("Vehicle found:", vehicle?._id);
    console.log("Vehicle make/model:", vehicle?.make, vehicle?.model);

    console.log("\n=== Step 2: Check pricing records for this vehicle ===");
    const pricingsCollection = db.collection("pricings");
    const pricings = await pricingsCollection.find({ vehicle_id: new Types.ObjectId(vehicleId) }).toArray();
    console.log("Number of pricing records:", pricings.length);
    pricings.forEach((p, idx) => {
      console.log(`\nPricing ${idx + 1}:`);
      console.log("  _id:", p._id);
      console.log("  vehicle_id:", p.vehicle_id, "(type:", typeof p.vehicle_id, ")");
      console.log("  effective_from:", p.effective_from);
      console.log("  effective_to:", p.effective_to);
      console.log("  deposit_amount:", p.deposit_amount);
      console.log("  price_per_day:", p.price_per_day);
    });

    console.log("\n=== Step 3: Run aggregation pipeline ===");
    const pipeline: any[] = [
      {
        $match: {
          _id: new Types.ObjectId(vehicleId),
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
          pricing_all_count: { $size: "$pricing_all" },
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
                      { $lte: ["$$price.effective_from", currentDate] },
                      {
                        $or: [{ $eq: ["$$price.effective_to", null] }, { $gte: ["$$price.effective_to", currentDate] }],
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

    const result = await vehiclesCollection.aggregate(pipeline).toArray();
    console.log("\nAggregation result:");
    console.log("  pricing_all_count:", result[0]?.pricing_all_count);
    console.log("  pricing:", result[0]?.pricing);
    console.log("\nFull result:", JSON.stringify(result[0], null, 2));

    await connection.close();
    console.log("\nDatabase connection closed");
  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  }
}

// Run the test
void testPricingAggregation();
