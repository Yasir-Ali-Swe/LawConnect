import mongoose from "mongoose";

const userProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    province: {
      type: String,
      required: true,
      enum: ["Punjab", "Sindh", "KPK", "Balochistan"],
    },
    profileImageUrl: {
      type: String,
      default: null,
    },
    profileImagePublicId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

const UserProfileModel = mongoose.model("UserInfo", userProfileSchema);

export default UserProfileModel;
