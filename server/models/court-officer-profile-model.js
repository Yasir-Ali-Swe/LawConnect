import mongoose from "mongoose";

const CourtOfficerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
    },
    courtId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Court",
      required: false,
    },
    courtOfficerProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserInfo",
      required: false,
    },
    designation: { type: String, default: "Court Officer" },
    education: [
      {
        degree: { type: String },
        institute: { type: String },
        startDate: { type: Date },
        endDate: { type: Date },
      },
    ],
    professionalInfo: {
      bio: { type: String },
      experience: { type: Number },
      specialization: [{ type: String }],
      notes: { type: String },
    },
  },
  { timestamps: true },
);

export default mongoose.model("CourtOfficerProfile", CourtOfficerProfileSchema);
