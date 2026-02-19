import mongoose from "mongoose";

const electricityRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    electricityUsed: {
      type: Number,
      required: [true, "Electricity used (kWh) is required"],
      min: [0, "Electricity used cannot be negative"],
    },
    carbonEmitted: {
      type: Number,
      required: true,
      min: 0,
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
    dailyAvgElectricity: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const ElectricityRecord = mongoose.model(
  "ElectricityRecord",
  electricityRecordSchema
);
export default ElectricityRecord;