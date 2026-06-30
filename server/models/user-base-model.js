import mongoose from "mongoose";

const userBaseSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["client", "admin", "clerk", "lawyer", "court_officer"],
      default: "client",
    },
    isVerified: { type: Boolean, default: false },
    isProfileComplete: { type: Boolean, default: false },
    tokenVersion: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: function() {
        return this.role === "lawyer" ? "inactive" : "active";
      },
    },
  },
  { timestamps: true },
);

const UserBaseModel = mongoose.model("User", userBaseSchema);
export default UserBaseModel;
