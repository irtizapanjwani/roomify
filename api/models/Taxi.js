import mongoose from "mongoose";

const TaxiSchema = new mongoose.Schema(
  {
    serviceType: {
      type: String,
      enum: ["basic", "standard", "premium"],
      required: true,
    },
    pickupDate: {
      type: String,
      required: true,
    },
    pickupTime: {
      type: String,
      required: true,
    },
    pickupAddress: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Taxi", TaxiSchema);
