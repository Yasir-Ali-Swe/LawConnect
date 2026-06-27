import mongoose from "mongoose";

export const CASE_STATUS_ENUM = ["pending", "active", "decided", "closed"];
export const SUBMISSION_STATUS_ENUM = ["draft", "submitted", "registered"];

const CaseSchema = new mongoose.Schema(
  {
    caseNumber: { type: String, unique: true, sparse: true },

    title: { type: String, required: true },

    type: {
      type: String,
      enum: [
        "Civil",
        "Criminal",
        "Family",
        "Corporate",
        "Labor",
        "Property",
        "Political",
        "Tax",
      ],
      required: true,
    },

    description: { type: String, default: null, required: true },

    courtId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Court",
      default: null,
    },

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
    courtOfficerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    status: {
      type: String,
      enum: CASE_STATUS_ENUM,
      default: "pending",
    },

    submissionStatus: {
      type: String,
      enum: SUBMISSION_STATUS_ENUM,
      default: "draft",
    },

    parties: [
      {
        role: {
          type: String,
          enum: ["PLAINTIFF", "DEFENDANT"],
          required: true,
        },
        name: { type: String, required: true },
      },
    ],

    documents: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        title: { type: String, default: null },
        uploadedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    filedByLawyerAt: { type: Date, default: null },
    registeredByClerkAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export default mongoose.model("Case", CaseSchema);
