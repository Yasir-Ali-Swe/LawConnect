import mongoose from "mongoose";

const JudgmentSchema = new mongoose.Schema(
    {
        caseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Case",
            required: true,
            unique: true,
        },
        judgmentDetails: {
            type: String,
            required: true,
        },
        verdict: {
            type: String, // e.g., "Guilty", "Not Guilty", "Dismissed", "Settled"
        },
        documentUrl: {
            type: String,
            default: null,
        },
        documentPublicId: {
            type: String,
            default: null,
        },
        documentOriginalName: {
            type: String,
            default: null,
        },
        documentMimeType: {
            type: String,
            default: null,
        },
        documentSize: {
            type: Number,
            default: null,
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Judgment", JudgmentSchema);
