import caseModel from "../models/case-model.js";
import hearingModel from "../models/hearing-model.js";
import judgmentModel from "../models/judgment-model.js";
import courtOfficerProfileModel from "../models/court-officer-profile-model.js";
import userInfoModel from "../models/user-info-model.js";
import userBaseModel from "../models/user-base-model.js";
import { notifyCaseParties } from "../services/notification-service.js";
import { replaceProfileImage } from "../utils/profile-image-service.js";
import { encrypt } from "../utils/crypto.js";
import cloudinary from "../config/cloudinary.js";

export const courtOfficerGetAllTheCase = async (req, res) => {
    try {
        const courtOfficerId = req.userId.toString();
        if (!courtOfficerId) {
            return res.status(401).json({ success: false, message: "Unauthorized" })
        }
        const cases = await caseModel.find({ courtOfficerId })
            .populate("lawyerId", "fullName email")
            .populate("courtId", "name type city province")
            .populate("clientId", "fullName email")
            .populate("courtOfficerId", "fullName email")
            .sort({ updatedAt: -1 });

        if (cases.length === 0) {
            return res.status(200).json({ success: true, message: "No cases assigned yet", data: [] })
        }
        return res.status(200).json({ success: true, message: "Cases fetched successfully", data: cases })
    } catch (error) {
        res.status(500).json({ success: false, message: "Intternal Server Error", error: error.message })
    }
}


export const getActiveCaseById = async (req, res) => {
    try {
        const courtOfficerId = req.userId.toString();
        const { caseId } = req.params;
        if (!caseId) {
            return res.status(400).json({ success: false, message: "caseId is required" })
        }
        const activeCase = await caseModel.findById(caseId).populate("lawyerId").populate("courtId").populate("courtOfficerId").populate("clientId", "fullName email");
        if (!activeCase) {
            return res.status(404).json({ success: false, message: "Case not found" })
        }
        if (!activeCase.courtOfficerId || activeCase.courtOfficerId._id.toString() !== courtOfficerId) {
            return res.status(401).json({ success: false, message: "Unauthorized" })
        }
        return res.status(200).json({ success: true, message: "Case fetched successfully", data: activeCase })
    } catch (error) {
        res.status(500).json({ success: false, message: "Intternal Server Error", error: error.message })
    }
}

export const updateCaseStatus = async (req, res) => {
    try {
        const courtOfficerId = req.userId.toString();
        const { caseId } = req.params;
        const { status, judgmentDetails, verdict } = req.body;

        if (!caseId || !status) {
            return res.status(400).json({ success: false, message: "caseId and status are required" });
        }

        const validStatuses = ["pending", "active", "decided", "closed"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status" });
        }

        const caseData = await caseModel.findById(caseId);
        if (!caseData) {
            return res.status(404).json({ success: false, message: "Case not found" });
        }

        if (!caseData.courtOfficerId || caseData.courtOfficerId.toString() !== courtOfficerId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        if (caseData.status === "decided" || caseData.status === "closed") {
            return res.status(400).json({ success: false, message: "Cannot change status of a decided or closed case" });
        }

        if (status === "decided" || status === "closed") {
            if (!judgmentDetails) {
                return res.status(400).json({ success: false, message: "Judgment details are required for decided or closed cases" });
            }
            // Check if judgment already exists to avoid duplicates if accidentally called
            const existingJudgment = await judgmentModel.findOne({ caseId });
            if (!existingJudgment) {
                const encryptedDetails = encrypt(judgmentDetails);
                await judgmentModel.create({
                    caseId,
                    judgmentDetails: encryptedDetails,
                    verdict
                });
            }
        }

        if (status === "decided" || status === "closed") {
            // ... existing judgment logic ...
        }

        caseData.status = status;
        await caseData.save();

        // Notify Parties
        await notifyCaseParties(caseId, courtOfficerId, {
            type: "status",
            title: `Case Status Updated: ${status.toUpperCase()}`,
            message: `The status of case ${caseData.caseNumber} has been updated to ${status}.`,
            metadata: { status }
        });

        return res.status(200).json({ success: true, message: "Case status updated successfully", data: caseData });

    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

export const scheduleHearing = async (req, res) => {
    try {
        const courtOfficerId = req.userId.toString();
        const caseId = req.params.caseId;
        const { date, remarks, status } = req.body;

        if (!caseId || !date || !remarks) {
            return res.status(400).json({ success: false, message: "caseId, date, and remarks are required" });
        }

        // Validate date is not in the past? Optional but good practice.
        // For now, sticking to requirements.

        const hearingData = {
            caseId,
            date,
            remarks,
            updatedBy: courtOfficerId,
            updatedByRole: "court_officer"
        };

        if (status) {
            const validStatuses = ["scheduled", "adjourned", "completed"];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ success: false, message: "Invalid status" });
            }
            hearingData.status = status;
        }

        const caseData = await caseModel.findById(caseId);
        if (!caseData) {
            return res.status(404).json({ success: false, message: "Case not found" });
        }

        if (!caseData.courtOfficerId || caseData.courtOfficerId.toString() !== courtOfficerId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const newHearing = await hearingModel.create(hearingData);

        // Notify Parties
        await notifyCaseParties(caseId, courtOfficerId, {
            type: "hearing",
            title: "New Hearing Scheduled",
            message: `A new hearing has been scheduled for ${new Date(date).toDateString()}. Remarks: ${remarks}`,
            metadata: { hearingDate: date, remarks }
        });

        return res.status(201).json({ success: true, message: "Hearing scheduled successfully", data: newHearing });

    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

export const updateHearingStatus = async (req, res) => {
    try {
        const courtOfficerId = req.userId.toString();
        const { hearingId } = req.params;
        const { status, updatedReason } = req.body;

        if (!hearingId || !status) {
            return res.status(400).json({ success: false, message: "hearingId and status are required" });
        }

        const validStatuses = ["scheduled", "adjourned", "completed"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status" });
        }

        if (!updatedReason) {
            return res.status(400).json({ success: false, message: "Reason is required when updating a hearing" });
        }

        const hearing = await hearingModel.findById(hearingId).populate("caseId");
        if (!hearing) {
            return res.status(404).json({ success: false, message: "Hearing not found" });
        }

        // Check authorization via case
        const caseData = hearing.caseId;
        if (!caseData || !caseData.courtOfficerId || caseData.courtOfficerId.toString() !== courtOfficerId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        // Prevent update if hearing is already completed, adjourned, or cancelled (i.e., not scheduled)
        if (hearing.status !== "scheduled") {
            return res.status(403).json({ success: false, message: "Cannot update a completed or adjourned hearing" });
        }

        hearing.status = status;
        hearing.updatedReason = updatedReason;
        hearing.updatedBy = courtOfficerId;
        hearing.updatedByRole = "court_officer";
        await hearing.save();

        // Notify Parties
        await notifyCaseParties(hearing.caseId._id || hearing.caseId, courtOfficerId, {
            type: "hearing",
            title: "Hearing Updated",
            message: `Hearing on ${new Date(hearing.date).toDateString()} has been updated to ${status}. Reason: ${updatedReason}`,
            metadata: { hearingDate: hearing.date, status, updatedReason }
        });

        return res.status(200).json({ success: true, message: "Hearing status updated successfully", data: hearing });

    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

export const getAllHearingsForCase = async (req, res) => {
    try {
        const courtOfficerId = req.userId.toString();
        const { caseId } = req.params;

        if (!caseId) {
            return res.status(400).json({ success: false, message: "caseId is required" });
        }

        const caseData = await caseModel.findById(caseId);
        if (!caseData) {
            return res.status(404).json({ success: false, message: "Case not found" });
        }

        if (!caseData.courtOfficerId || caseData.courtOfficerId.toString() !== courtOfficerId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const hearings = await hearingModel.find({ caseId }).sort({ date: 1 });
        return res.status(200).json({ success: true, message: "Hearings fetched successfully", data: hearings });

    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

export const makeJudgment = async (req, res) => {
    try {
        const courtOfficerId = req.userId.toString();
        const { caseId } = req.params;
        const { judgmentDetails, verdict } = req.body;

        if (!caseId || !judgmentDetails) {
            return res.status(400).json({ success: false, message: "caseId and judgmentDetails are required" });
        }

        const caseData = await caseModel.findById(caseId);
        if (!caseData) {
            return res.status(404).json({ success: false, message: "Case not found" });
        }

        if (!caseData.courtOfficerId || caseData.courtOfficerId.toString() !== courtOfficerId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        // Check if judgment already exists
        const existingJudgment = await judgmentModel.findOne({ caseId });
        if (existingJudgment) {
            return res.status(409).json({
                success: false,
                message: "This court decision has already been finalized and cannot be modified."
            });
        }

        // Validate document if provided
        let uploadResult = null;
        if (req.file) {
            const allowedMimeTypes = [
                "application/pdf",
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ];
            if (!allowedMimeTypes.includes(req.file.mimetype)) {
                return res.status(400).json({ success: false, message: "Invalid file type. Only PDF, DOC, and DOCX are allowed." });
            }
            if (req.file.size > 10 * 1024 * 1024) { // 10MB limit
                return res.status(400).json({ success: false, message: "File is too large. Maximum size is 10MB." });
            }

            // Upload buffer to Cloudinary
            uploadResult = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: `fyp/cases/${caseId}/judgment`,
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
        }

        // Encrypt judgment text
        const encryptedDetails = encrypt(judgmentDetails.trim());

        // Create new judgment
        const judgmentData = {
            caseId,
            judgmentDetails: encryptedDetails,
            verdict: verdict ? verdict.trim() : "",
        };

        if (uploadResult) {
            judgmentData.documentUrl = uploadResult.secure_url;
            judgmentData.documentPublicId = uploadResult.public_id;
            judgmentData.documentOriginalName = req.file.originalname;
            judgmentData.documentMimeType = req.file.mimetype;
            judgmentData.documentSize = req.file.size;
            judgmentData.uploadedBy = courtOfficerId;
        }

        const judgment = await judgmentModel.create(judgmentData);

        // Change case status to decided
        caseData.status = "decided";
        await caseData.save();

        // Notify Parties
        await notifyCaseParties(caseId, courtOfficerId, {
            type: "judgment",
            title: "Judgment Released",
            message: `A judgment has been released for case ${caseData.caseNumber}. Verdict: ${verdict}`,
            metadata: { verdict }
        });

        return res.status(201).json({
            success: true,
            message: "Judgment created and case decided successfully",
            data: judgment
        });

    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

export const getDashboardStats = async (req, res) => {
    try {
        const courtOfficerId = req.userId.toString();

        // 1. KPI Counts for Assigned Cases
        const totalAssigned = await caseModel.countDocuments({ courtOfficerId });
        const activeCases = await caseModel.countDocuments({ courtOfficerId, status: "active" });
        const decidedCases = await caseModel.countDocuments({ courtOfficerId, status: "decided" });
        const pendingCases = await caseModel.countDocuments({ courtOfficerId, status: "pending" }); // Not yet active? Or submitted?

        // 2. Upcoming Hearings (Next 5)
        // Find hearings where case is assigned to this officer AND date >= today
        // We need cases assigned to this officer first? 
        // Or updatedByRole matches? Better to query Hearing -> Case match.
        // Actually, easiest is: Find cases for this officer, then find hearings for those cases.
        const myCases = await caseModel.distinct("_id", { courtOfficerId });
        const upcomingHearings = await hearingModel.find({
            caseId: { $in: myCases },
            date: { $gte: new Date() },
            status: "scheduled"
        })
            .sort({ date: 1 })
            .limit(5)
            .populate("caseId", "title caseNumber");

        return res.status(200).json({
            success: true,
            stats: {
                totalAssigned,
                activeCases,
                decidedCases,
                pendingCases
            },
            upcomingHearings
        });

    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching dashboard stats", error: error.message });
    }
};

export const getProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await userBaseModel.findById(userId).select("-password");
        const userInfo = await userInfoModel.findOne({ userId });
        const officerProfile = await courtOfficerProfileModel.findOne({ userId }).populate("courtId", "name type");

        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        res.status(200).json({
            success: true,
            data: {
                ...user.toObject(),
                info: userInfo || {},
                officerDetails: officerProfile || {}
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching profile", error: error.message });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const {
            fullName,
            email,
            dob,
            city,
            province,
            profileImageUrl,
            education,
            professionalInfo,
        } = req.body;

        const hasPersonalInput =
            dob ||
            city ||
            province ||
            profileImageUrl !== undefined ||
            !!req.file;

        // 0. Update UserBase (Account Details)
        if (fullName || email) {
            const userUpdate = {};
            if (fullName) userUpdate.fullName = fullName;
            if (email) userUpdate.email = email;
            await userBaseModel.findByIdAndUpdate(userId, userUpdate);
        }

        // 1. Upsert UserInfo (only if personal fields are part of this request)
        let userInfo = await userInfoModel.findOne({ userId });
        if (hasPersonalInput) {
            if (userInfo) {
                if (dob) userInfo.dob = dob;
                if (city) userInfo.city = city;
                if (province) userInfo.province = province;

                if (profileImageUrl !== undefined) {
                    userInfo.profileImageUrl = profileImageUrl;
                    if (!profileImageUrl) {
                        userInfo.profileImagePublicId = null;
                    }
                }

                if (req.file) {
                    const imageData = await replaceProfileImage({
                        file: req.file,
                        userId,
                        existingUrl: userInfo.profileImageUrl,
                        existingPublicId: userInfo.profileImagePublicId,
                    });

                    userInfo.profileImageUrl = imageData.profileImageUrl;
                    userInfo.profileImagePublicId = imageData.profileImagePublicId;
                }

                await userInfo.save();
            } else {
                if (!dob || !city || !province) {
                    return res.status(400).json({
                        success: false,
                        message: "dob, city and province are required for personal profile",
                    });
                }

                const imageData = await replaceProfileImage({
                    file: req.file,
                    userId,
                    existingUrl: profileImageUrl || null,
                    existingPublicId: null,
                });

                userInfo = await userInfoModel.create({
                    userId,
                    dob,
                    city,
                    province,
                    profileImageUrl: imageData.profileImageUrl,
                    profileImagePublicId: imageData.profileImagePublicId,
                });
            }
        }

        // 2. Upsert CourtOfficerProfile
        let officerProfile = await courtOfficerProfileModel.findOne({ userId });

        if (officerProfile) {
            if (education) officerProfile.education = education;
            if (professionalInfo) officerProfile.professionalInfo = professionalInfo;
            await officerProfile.save();
        } else {
            officerProfile = await courtOfficerProfileModel.create({
                userId,
                courtOfficerProfileId: userInfo._id,
                education: education || [],
                professionalInfo: professionalInfo || {},
                // courtId is optional now, allowed by schema change
            });
        }

        // 3. Check for Completion
        const isPersonalComplete = !!(userInfo?.dob && userInfo?.city && userInfo?.province);
        const isEducationComplete = officerProfile.education && officerProfile.education.length > 0;
        const isProfessionalComplete = officerProfile.professionalInfo &&
            officerProfile.professionalInfo.bio &&
            officerProfile.professionalInfo.experience;

        if (isPersonalComplete && isEducationComplete && isProfessionalComplete) {
            await userBaseModel.findByIdAndUpdate(userId, { isProfileComplete: true });
        }

        res.status(200).json({ success: true, message: "Profile updated successfully", data: { userInfo, officerProfile } });

    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating profile", error: error.message });
    }
};