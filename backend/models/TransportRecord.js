import mongoose from "mongoose";

const transportRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    kmDriven: {
      type: Number,
      required: [true, "KM driven is required"],
      min: [0, "KM driven cannot be negative"],
    },
    fuelEfficiencyKmpl: {
      type: Number,
      required: [true, "Fuel efficiency (kmpl) is required"],
      min: [0.1, "Fuel efficiency must be greater than 0"],
    },
    fuelType: {
      type: String,
      required: [true, "Fuel type is required"],
      enum: ["petrol", "diesel"],
      lowercase: true,
    },
    fuelUsedLiters: {
      type: Number,
      required: true,
    },
    carbonEmitted: {
      type: Number,
      required: true,
    },
    dateFrom: {
      type: Date,
      required: [true, "Start date is required"],
    },
    dateTo: {
      type: Date,
      required: [true, "End date is required"],
    },
    durationDays: {
      type: Number,
      required: true,
    },
    dailyAvgCarbon: {
      type: Number,
      required: true,
    },
    dailyAvgKm: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const TransportRecord = mongoose.model("TransportRecord", transportRecordSchema);
export default TransportRecord;