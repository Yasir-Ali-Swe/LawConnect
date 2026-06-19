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
    },
    { timestamps: true }
);

export default mongoose.model("Judgment", JudgmentSchema);
