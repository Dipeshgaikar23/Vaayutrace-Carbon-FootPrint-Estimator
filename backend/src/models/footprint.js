import mongoose from "mongoose";

const footprintSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ["electricity", "transport", "manufacturing", "construction", "agriculture"],
      required: true,
    },
    inputData: { type: Object, required: true },
    result: { type: Number, required: true },
    predictions:{type: Object, required: true},
    comparison:{type:Object, require:true},
    suggestion: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",   // only present if authenticated
      required: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Footprint", footprintSchema);
