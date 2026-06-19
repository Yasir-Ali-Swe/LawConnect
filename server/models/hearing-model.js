import mongoose from "mongoose";

const HearingSchema = new mongoose.Schema(
  {
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Case",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["scheduled", "adjourned", "completed"],
      default: "scheduled",
    },

    remarks: {
      type: String,
      required: true,
    },

    updatedReason: {
      type: String,
      default: null,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    updatedByRole: {
      type: String,
      enum: ["clerk", "court_officer"],
    },
  },
  { timestamps: true },
);

export default mongoose.model("Hearing", HearingSchema);
