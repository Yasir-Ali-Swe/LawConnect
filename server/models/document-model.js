import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema(
    {
        caseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Case",
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
        publicId: {
            type: String,
            default: null,
        },
        type: {
            type: String, // e.g., "Petition", "Evidence", "Order"
            default: "General",
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Document", DocumentSchema);
