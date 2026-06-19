import mongoose from "mongoose";

const ClerkProfileSchema = new mongoose.Schema(
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
      unique: true,
      required: true,
    },
    clerkProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserInfo",
      required: true,
    },
    designation: { type: String, default: "Clerk" },
  },
  { timestamps: true },
);

export default mongoose.model("ClerkProfile", ClerkProfileSchema);
