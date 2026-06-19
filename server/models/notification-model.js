import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Can be Client or Lawyer (UserBase)
        required: true
    },
    role: {
        type: String,
        enum: ["lawyer", "client", "court_officer", "clerk", "admin"], // Broaden if needed
        required: true
    },
    caseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Case",
        required: true
    },
    type: {
        type: String,
        enum: ["status", "hearing", "judgment", "submission", "assignment"],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    metadata: {
        hearingDate: Date,
        status: String,
        submissionStatus: String,
        updatedReason: String
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export default mongoose.model("Notification", notificationSchema);
