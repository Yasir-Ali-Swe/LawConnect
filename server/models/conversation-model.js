import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    lawyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

conversationSchema.index({ clientId: 1, lawyerId: 1 }, { unique: true });

const conversationModel = mongoose.model("Conversation", conversationSchema);

export default conversationModel;