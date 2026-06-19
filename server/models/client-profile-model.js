import mongoose from "mongoose";

const clientProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    clientProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserProfile",
      required: true,
    },
  },
  { timestamps: true },
);

const ClientProfile = mongoose.model("ClientProfile", clientProfileSchema);

export default ClientProfile;
