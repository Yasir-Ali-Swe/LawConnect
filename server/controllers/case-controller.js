import crypto from "crypto";
import mongoose from "mongoose";
import caseModel, {
    CASE_STATUS_ENUM,
    SUBMISSION_STATUS_ENUM,
} from "../models/case-model.js";
import clerkProfileModel from "../models/clerk-profile-model.js";
import courtOfficerProfileModel from "../models/court-officer-profile-model.js";
import ProposalModel from "../models/proposal-model.js";
import courtModel from "../models/court-model.js";
import userBaseModel from "../models/user-base-model.js";
import { createNotification } from "../services/notification-service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import cloudinary from "../config/cloudinary.js";

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildSearchCondition = (search) => {
    const trimmedSearch = typeof search === "string" ? search.trim() : "";
    if (!trimmedSearch) return null;

    const orConditions = [
        { caseNumber: { $regex: escapeRegex(trimmedSearch), $options: "i" } },
    ];

    if (mongoose.Types.ObjectId.isValid(trimmedSearch)) {
        orConditions.push({ _id: trimmedSearch });
    }

    return { $or: orConditions };
};

const getValidatedStatus = (status) => {
    if (!status || status === "all") return null;
    return CASE_STATUS_ENUM.includes(status) ? status : null;
};

const getValidatedSubmissionStatus = (submissionStatus) => {
    if (!submissionStatus || submissionStatus === "all") return null;
    return SUBMISSION_STATUS_ENUM.includes(submissionStatus)
        ? submissionStatus
        : null;
};

export const clientGetCases = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const user = await userBaseModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const { search, status, submissionStatus } = req.query;
        const query = {
            clientId: userId,
        };

        const validatedStatus = getValidatedStatus(status);
        if (validatedStatus) {
            query.status = validatedStatus;
        }

        const validatedSubmissionStatus =
            getValidatedSubmissionStatus(submissionStatus);
        if (validatedSubmissionStatus) {
            query.submissionStatus = validatedSubmissionStatus;
        }

        const searchCondition = buildSearchCondition(search);
        if (searchCondition) {
            query.$and = [searchCondition];
        }

        // Find cases where clientId matches
        const cases = await caseModel.find(query)
            .populate("courtId", "name city")
            .populate("lawyerId", "fullName email")
            .sort({ createdAt: -1 });

        return res.status(200).json({ success: true, data: cases });

    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

export const clientGetCaseById = async (req, res) => {
    try {
        const userId = req.userId;
        const { caseId } = req.params;

        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const user = await userBaseModel.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const caseData = await caseModel.findById(caseId)
            .populate("courtId", "name city")
            .populate("lawyerId", "fullName email")
            .populate("courtOfficerId", "fullName email")
            .populate("clientId", "fullName email");

        if (!caseData) return res.status(404).json({ success: false, message: "Case not found" });

        // Authorization: Check if clientId matches
        const clientId = caseData.clientId?._id || caseData.clientId;

        if (!clientId || clientId.toString() !== userId.toString()) {
            console.log(`Auth Fail: Case Client ${clientId} vs User ${userId}`);
            return res.status(403).json({ success: false, message: "You do not have permission to view this case." });
        }

        return res.status(200).json({ success: true, data: caseData });

    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

export const clientDraftCase = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const user = await userBaseModel.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const { title, type, description, parties = [], lawyerId } = req.body;

        if (!title || !type || !description) {
            return res.status(400).json({ success: false, message: "Title, Type, and Description are required." });
        }

        // Auto-add client as Party if not exists
        const clientPartyExists = parties.some(p => p.name === user.fullName);
        const finalParties = clientPartyExists ? parties : [
            ...parties,
            { role: "PLAINTIFF", name: user.fullName }
        ];

        const draftCase = await caseModel.create({
            title,
            type,
            description,
            parties: finalParties,
            lawyerId: lawyerId || undefined, // Optional
            submissionStatus: "draft",
            status: "pending"
        });

        res.status(201).json({ success: true, message: "Case drafted successfully", data: draftCase });

    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

export const lawyerGetCourts = async (req, res) => {
    try {
        const lawyerId = req.userId;
        if (!lawyerId) {
            return res.status(401).json({ success: false, message: "Unauthorized" })
        }
        // Fetch all courts (projection)
        const courts = await courtModel.find({}, "name type city province");
        return res.status(200).json({ success: true, data: courts });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message })
    }
};

export const lawyerDraftCase = async (req, res) => {
    try {
        const lawyerId = req.userId.toString();
        const { clientId, title, type, description, parties } = req.body;

        if (!lawyerId) {
            return res.status(401).json({ success: false, message: "Unauthorized" })
        }

        if (!clientId) {
            return res.status(400).json({ success: false, message: "Client is required." });
        }

        // Verify accepted proposal
        const proposal = await ProposalModel.findOne({
            lawyerId: lawyerId,
            clientId: clientId,
            status: "accepted"
        });

        if (!proposal) {
            return res.status(403).json({ success: false, message: "You can only draft cases for clients with an accepted proposal." });
        }

        const draftCase = await caseModel.create({
            clientId,
            lawyerId,
            title,
            type,
            description,
            parties,
            submissionStatus: "draft",
            status: "pending"
        })

        return res.status(201).json({ success: true, message: "Case drafted successfully", data: draftCase })

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message })
    }
}

export const lawyerUpateTheDraftCase = asyncHandler(async (req, res) => {
    const lawyerId = req.userId.toString();
    const { caseId } = req.params;

    if (!lawyerId) {
        throw new ApiError(401, "Unauthorized");
    }
    if (!caseId) {
        throw new ApiError(400, "caseId is required");
    }

    const draftCase = await caseModel.findById(caseId);
    if (!draftCase) {
        throw new ApiError(404, "Case not found");
    }

    if (draftCase.lawyerId.toString() !== lawyerId) {
        throw new ApiError(401, "Unauthorized");
    }

    if (draftCase.status !== "pending") {
        throw new ApiError(400, "You can not update the case");
    }

    if (draftCase.submissionStatus !== "draft") {
        throw new ApiError(400, "You can only edit draft cases");
    }

    // Ensure we don't accidentally wipe out required fields if not provided
    // but usually PUT means update what's there.
    // req.body should only contain updatable fields.
    const updatedCase = await caseModel.findByIdAndUpdate(caseId, { $set: req.body }, { new: true });

    return res.status(200).json({ success: true, message: "Draft updated successfully", data: updatedCase });
});


export const lawyerDeleteTheDraftCase = async (req, res) => {
    try {
        const lawyerId = req.userId.toString();
        if (!lawyerId) {
            return res.status(401).json({ success: false, message: "Unauthorized" })
        }
        const { caseId } = req.params;
        if (!caseId) {
            return res.status(400).json({ success: false, message: "caseId is required" })
        }
        const draftCase = await caseModel.findById(caseId);
        if (!draftCase) {
            return res.status(404).json({ success: false, message: "Case not found" })
        }
        if (draftCase.lawyerId.toString() !== lawyerId) {
            return res.status(401).json({ success: false, message: "Unauthorized" })
        }
        if (draftCase.status !== "pending") {
            return res.status(400).json({ success: false, message: "You can not delete the case" })
        }
        await caseModel.findByIdAndDelete(caseId)
        return res.status(200).json({ success: true, message: "Case deleted successfully" })
    } catch (error) {
        res.status(500).json({ success: false, message: "Intternal Server Error", error: error.message })
    }
}

export const lawyerGetTheCaseById = async (req, res) => {
    try {
        const lawyerId = req.userId.toString();
        if (!lawyerId) {
            return res.status(401).json({ success: false, message: "Unauthorized" })
        }
        const { caseId } = req.params;
        if (!caseId) {
            return res.status(400).json({ success: false, message: "caseId is required" })
        }
        const draftCase = await caseModel.findById(caseId)
            .populate("courtId", "name city province")
            .populate("courtOfficerId", "fullName email")
            .populate("lawyerId", "fullName email")
            .populate("clientId", "fullName email");

        if (!draftCase) {
            return res.status(404).json({ success: false, message: "Case not found" });
        }

        // Auth check (handling populated object)
        const ownerId = draftCase.lawyerId?._id || draftCase.lawyerId;
        if (!ownerId || ownerId.toString() !== lawyerId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        return res.status(200).json({ success: true, message: "Case fetched successfully", data: draftCase });
    } catch (error) {
        res.status(500).json({ success: false, message: "Intternal Server Error", error: error.message })
    }
}

export const lawyerGetAllTheCase = async (req, res) => {
    try {
        const lawyerId = req.userId.toString();
        if (!lawyerId) {
            return res.status(401).json({ success: false, message: "Unauthorized" })
        }
        const { search, status, submissionStatus } = req.query;

        const query = { lawyerId };

        const validatedStatus = getValidatedStatus(status);
        if (validatedStatus) {
            query.status = validatedStatus;
        }

        const validatedSubmissionStatus =
            getValidatedSubmissionStatus(submissionStatus);
        if (validatedSubmissionStatus) {
            query.submissionStatus = validatedSubmissionStatus;
        }

        const searchCondition = buildSearchCondition(search);
        if (searchCondition) {
            query.$and = [searchCondition];
        }

        const draftCase = await caseModel
            .find(query)
            .populate("clientId", "fullName email")
            .sort({ createdAt: -1 });
        return res.status(200).json({ success: true, message: "Case fetched successfully", data: draftCase })
    } catch (error) {
        res.status(500).json({ success: false, message: "Intternal Server Error", error: error.message })
    }
}

export const lawyerSubmitCase = async (req, res) => {
    try {
        const lawyerId = req.userId.toString();
        if (!lawyerId) {
            return res.status(401).json({ success: false, message: "Unauthorized" })
        }
        const { caseId } = req.params;
        const { courtId } = req.body;
        if (!caseId) {
            return res.status(400).json({ success: false, message: "caseId is required" })
        }
        if (!courtId) {
            return res.status(400).json({ success: false, message: "courtId is required" })
        }
        const draftCase = await caseModel.findById(caseId);
        if (!draftCase) {
            return res.status(404).json({ success: false, message: "Case not found" })
        }
        if (draftCase.lawyerId.toString() !== lawyerId) {
            return res.status(401).json({ success: false, message: "Unauthorized" })
        }
        if (draftCase.status !== "pending") {
            return res.status(400).json({ success: false, message: "You can not submit the case" })
        }
        if (draftCase.submissionStatus !== "draft") {
            return res.status(400).json({ success: false, message: "You can only submit the draft case" })
        }
        const submittedCase = await caseModel.findByIdAndUpdate(caseId, { $set: { submissionStatus: "submitted", filedByLawyerAt: new Date(), courtId: courtId } }, { new: true });

        // Notify Client about submission
        if (submittedCase.clientId) {
            await createNotification({
                userId: submittedCase.clientId,
                role: "client",
                caseId: submittedCase._id,
                type: "submission",
                title: "Case Submitted",
                message: `Your case "${submittedCase.title}" has been submitted to the court by your lawyer.`,
                metadata: { submissionStatus: "submitted" }
            });
        }

        // Notify Clerk (if a clerk is assigned to the selected court)
        const targetCourt = await courtModel.findById(submittedCase.courtId).select("clerkId");
        if (targetCourt?.clerkId) {
            await createNotification({
                userId: targetCourt.clerkId,
                role: "clerk",
                caseId: submittedCase._id,
                type: "submission",
                title: "New Case Submission",
                message: `A new case "${submittedCase.title}" has been submitted to your court and is awaiting registration.`,
                metadata: { submissionStatus: "submitted" }
            });
        }

        return res.status(200).json({ success: true, message: "Case submitted successfully", data: submittedCase })
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message })
    }
}

export const lawyerGetAcceptedClients = async (req, res) => {
    try {
        const lawyerId = req.userId.toString();
        // Find accepted proposals
        const proposals = await ProposalModel.find({ lawyerId: lawyerId, status: "accepted" })
            .populate("clientId", "fullName email");

        // Extract unique clients
        const clientsMap = new Map();
        proposals.forEach(p => {
            if (p.clientId) {
                clientsMap.set(p.clientId._id.toString(), {
                    _id: p.clientId._id,
                    fullName: p.clientId.fullName,
                    email: p.clientId.email
                });
            }
        });

        return res.status(200).json({ success: true, message: "Accepted clients fetched", data: Array.from(clientsMap.values()) });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}




export const clerkGetSubmitedCases = async (req, res) => {
    try {
        const clerkId = req.userId.toString();
        const { search, status, submissionStatus } = req.query;

        if (!clerkId) {
            return res.status(401).json({ success: false, message: "Unauthorized" })
        }
        const clerkProfile = await clerkProfileModel.findOne({ userId: clerkId })
        if (!clerkProfile) {
            return res.status(404).json({ success: false, message: "Clerk profile not found" })
        }

        const clerkCourtId = clerkProfile.courtId;

        const query = { courtId: clerkCourtId };

        const validatedStatus = getValidatedStatus(status);
        if (validatedStatus) {
            query.status = validatedStatus;
        }

        const submissionFilterRaw = submissionStatus || req.query.status;
        const validatedSubmissionStatus =
            getValidatedSubmissionStatus(submissionFilterRaw);

        if (validatedSubmissionStatus) {
            if (validatedSubmissionStatus === "draft") {
                return res.status(200).json({ success: true, message: "Submitted cases fetched successfully", data: [] });
            }
            query.submissionStatus = validatedSubmissionStatus;
        } else {
            // Clerk should never see draft cases
            query.submissionStatus = { $in: ["submitted", "registered"] };
        }

        const searchCondition = buildSearchCondition(search);
        if (searchCondition) {
            query.$and = [searchCondition];
        }

        const cases = await caseModel.find(query)
            .populate("clientId", "fullName email")
            .populate("lawyerId", "fullName email")
            .populate("courtOfficerId", "fullName email")
            .populate("courtId", "name city")
            .sort({ updatedAt: -1 });

        return res.status(200).json({ success: true, message: "Submitted cases fetched successfully", data: cases })

    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message, success: false })
    }
}

export const clerkGetCourtCases = async (req, res) => {
    try {
        const clerkId = req.userId.toString();
        const { search, status, submissionStatus } = req.query;

        const clerkProfile = await clerkProfileModel.findOne({ userId: clerkId });
        if (!clerkProfile) return res.status(404).json({ success: false, message: "Clerk profile not found" });

        const query = { courtId: clerkProfile.courtId };

        const validatedStatus = getValidatedStatus(status);
        if (validatedStatus) {
            query.status = validatedStatus;
        }

        const validatedSubmissionStatus =
            getValidatedSubmissionStatus(submissionStatus);

        if (validatedSubmissionStatus) {
            if (validatedSubmissionStatus === "draft") {
                return res.status(200).json({ success: true, data: [] });
            }
            query.submissionStatus = validatedSubmissionStatus;
        } else {
            // Clerk should never see draft cases
            query.submissionStatus = { $in: ["submitted", "registered"] };
        }

        const searchCondition = buildSearchCondition(search);
        if (searchCondition) {
            query.$and = [searchCondition];
        }

        const cases = await caseModel.find(query)
            .populate("clientId", "fullName email")
            .populate("lawyerId", "fullName email")
            .populate("courtOfficerId", "fullName email")
            .populate("courtId", "name city")
            .sort({ updatedAt: -1 });

        return res.status(200).json({ success: true, data: cases });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

export const clerkRegisterCase = async (req, res) => {
    try {
        const clerkId = req.userId.toString();
        const caseId = req.params.caseId;
        const { courtOfficerId } = req.body;

        if (!caseId || !courtOfficerId) {
            return res
                .status(400)
                .json({ success: false, message: "Case ID and Court Officer ID are required." });
        }

        const clerkProfile = await clerkProfileModel.findOne({ userId: clerkId });
        if (!clerkProfile) {
            return res.status(404).json({ success: false, message: "Clerk profile not found." });
        }

        const existingCase = await caseModel.findById(caseId);

        if (!existingCase) {
            return res.status(404).json({ success: false, message: "Case not found." });
        }

        // Prevent re-assignment if already registered/assigned
        if (existingCase.submissionStatus === "registered" || existingCase.courtOfficerId) {
            return res.status(400).json({ success: false, message: "Case is already assigned to a Court Officer." });
        }

        if (existingCase.submissionStatus !== "submitted") {
            return res.status(400).json({ success: false, message: "Case is not ready for registration." });
        }

        const courtOfficer = await courtOfficerProfileModel.findOne({
            userId: courtOfficerId,
            courtId: clerkProfile.courtId,
        });

        if (!courtOfficer) {
            return res
                .status(404)
                .json({ success: false, message: "Court Officer not found in your court." });
        }

        if (
            !existingCase.courtId ||
            existingCase.courtId.toString() !== clerkProfile.courtId.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to register this case.",
            });
        }

        existingCase.caseNumber = `CASE-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
        existingCase.submissionStatus = "registered";
        existingCase.status = "pending";
        existingCase.courtOfficerId = courtOfficerId;
        existingCase.registeredByClerkAt = new Date();

        await existingCase.save();

        // Notify Client about registration
        if (existingCase.clientId) {
            await createNotification({
                userId: existingCase.clientId,
                role: "client",
                caseId: existingCase._id,
                type: "submission",
                title: "Case Registered",
                message: `Your case "${existingCase.title}" has been registered by the court.`,
                metadata: { submissionStatus: "registered" },
            });
        }

        // Notify Assigned Court Officer
        await createNotification({
            userId: courtOfficerId,
            role: "court_officer",
            caseId: existingCase._id,
            type: "assignment",
            title: "New Case Assigned",
            message: `A newly registered case "${existingCase.title}" has been assigned to you.`,
            metadata: { submissionStatus: "registered", status: existingCase.status },
        });

        res
            .status(200)
            .json({ success: true, message: "Case registered successfully.", data: existingCase });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

export const clerkGetCaseById = async (req, res) => {
    try {
        const clerkId = req.userId.toString();
        const { caseId } = req.params;

        if (!caseId) return res.status(400).json({ success: false, message: "Case ID is required." });

        const clerkProfile = await clerkProfileModel.findOne({ userId: clerkId });
        if (!clerkProfile) return res.status(404).json({ success: false, message: "Clerk profile not found." });

        const caseData = await caseModel.findOne({
            _id: caseId,
            courtId: clerkProfile.courtId
        })
            .populate("clientId", "fullName email")
            .populate("lawyerId", "fullName email")
            .populate("courtOfficerId", "fullName email")
            .populate("courtId", "name city");

        if (!caseData) {
            return res.status(404).json({ success: false, message: "Case not found or not in your court." });
        }

        return res.status(200).json({ success: true, data: caseData });

    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

// Sub-resource getters for Lawyer Dashboard
import hearingModel from "../models/hearing-model.js";
import judgmentModel from "../models/judgment-model.js";

const verifyCaseAccess = async (caseId, userId) => {
    const caseData = await caseModel.findById(caseId);
    if (!caseData) return "not_found";

    // Check Lawyer
    const isLawyer = caseData.lawyerId && (
        caseData.lawyerId.toString() === userId ||
        caseData.lawyerId?._id?.toString() === userId
    );

    // Check Client
    const isClient = caseData.clientId && (
        caseData.clientId.toString() === userId ||
        caseData.clientId?._id?.toString() === userId
    );

    // Check Court Officer (if needed, but prompt focused on Client/Lawyer)
    const isOfficer = caseData.courtOfficerId && (
        caseData.courtOfficerId.toString() === userId ||
        caseData.courtOfficerId?._id?.toString() === userId
    );

    if (isLawyer || isClient || isOfficer) return "authorized";
    return "unauthorized";
};

export const getCaseHearings = async (req, res) => {
    try {
        const { caseId } = req.params;
        const userId = req.userId.toString();

        const access = await verifyCaseAccess(caseId, userId);
        if (access === "not_found") return res.status(404).json({ success: false, message: "Case not found" });
        if (access === "unauthorized") return res.status(403).json({ success: false, message: "Unauthorized access to case hearings" });

        const hearings = await hearingModel.find({ caseId }).sort({ date: 1 });
        res.status(200).json({ success: true, data: hearings });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching hearings", error: error.message });
    }
};

export const getCaseDocuments = async (req, res) => {
    try {
        const { caseId } = req.params;
        const userId = req.userId.toString();

        const access = await verifyCaseAccess(caseId, userId);
        if (access === "not_found") return res.status(404).json({ success: false, message: "Case not found" });
        if (access === "unauthorized") return res.status(403).json({ success: false, message: "Unauthorized access to case documents" });

        const caseData = await caseModel
            .findById(caseId)
            .populate("documents.uploadedBy", "fullName");

        const documents = (caseData?.documents || []).sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        res.status(200).json({ success: true, data: documents });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching documents", error: error.message });
    }
};

export const uploadCaseDocument = async (req, res) => {
    try {
        const { caseId } = req.params;
        const userId = req.userId.toString();

        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file provided." });
        }

        const user = await userBaseModel.findById(userId);
        if (!user || user.role !== "client") {
            return res.status(403).json({ success: false, message: "Only clients can upload documents." });
        }

        // Verify case exists and belongs to this client
        const caseData = await caseModel.findById(caseId);
        if (!caseData) {
            return res.status(404).json({ success: false, message: "Case not found." });
        }

        const caseClientId = caseData.clientId?._id?.toString() || caseData.clientId?.toString();
        if (caseClientId !== userId) {
            return res.status(403).json({ success: false, message: "You can only upload documents to your own case." });
        }

        // Upload buffer to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: `fyp/cases/${caseId}`,
                    resource_type: "auto",
                    use_filename: true,
                    unique_filename: true,
                },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            );
            stream.end(req.file.buffer);
        });

        caseData.documents.push({
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            uploadedBy: userId,
        });

        await caseData.save();
        await caseData.populate("documents.uploadedBy", "fullName");

        const uploadedDoc = caseData.documents[caseData.documents.length - 1];
        return res.status(201).json({ success: true, message: "Document uploaded successfully.", data: uploadedDoc });

    } catch (error) {
        res.status(500).json({ success: false, message: "Error uploading document", error: error.message });
    }
};

export const getCaseJudgments = async (req, res) => {
    try {
        const { caseId } = req.params;
        const userId = req.userId.toString();

        const access = await verifyCaseAccess(caseId, userId);
        if (access === "not_found") return res.status(404).json({ success: false, message: "Case not found" });
        if (access === "unauthorized") return res.status(403).json({ success: false, message: "Unauthorized access to case judgments" });

        const judgments = await judgmentModel.find({ caseId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: judgments });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching judgments", error: error.message });
    }
};
