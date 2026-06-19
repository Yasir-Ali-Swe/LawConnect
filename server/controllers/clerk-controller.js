import clerkProfileModel from "../models/clerk-profile-model.js";
import { notifyCaseParties } from "../services/notification-service.js";
import courtOfficerProfileModel from "../models/court-officer-profile-model.js";
import userInfoModel from "../models/user-info-model.js";
import caseModel from "../models/case-model.js";
import userBaseModel from "../models/user-base-model.js";
import { replaceProfileImage } from "../utils/profile-image-service.js";

export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.userId;
    const clerkProfile = await clerkProfileModel.findOne({ userId });

    if (!clerkProfile) {
      return res
        .status(404)
        .json({ success: false, message: "Clerk profile not found" });
    }

    const courtId = clerkProfile.courtId;

    // 1. Case Counts
    const submittedCases = await caseModel.countDocuments({
      courtId,
      submissionStatus: "submitted",
    });

    const registeredCases = await caseModel.countDocuments({
      courtId,
      submissionStatus: "registered",
    });

    // 2. Court Officer Count
    const availableOfficers = await courtOfficerProfileModel.countDocuments({
      courtId,
    });

    // 3. Recent Registered Cases (Limit 5)
    const recentRegistered = await caseModel
      .find({
        courtId,
        submissionStatus: "registered",
      })
      .sort({ registeredByClerkAt: -1 })
      .limit(5)
      .populate("courtOfficerId", "fullName email"); // Populate officer info if helpful, userBase usually has name

    return res.status(200).json({
      success: true,
      stats: {
        submittedCases,
        registeredCases,
        availableOfficers,
      },
      recentActivity: recentRegistered,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard stats",
      error: error.message,
    });
  }
};

// --- Profile ---
export const getMyProfile = async (req, res) => {
  try {
    const userId = req.userId;
    // Fetch UserBase + UserInfo + ClerkProfile
    const user = await userBaseModel.findById(userId).select("-password");
    const userInfo = await userInfoModel.findOne({ userId });
    const clerkInfo = await clerkProfileModel
      .findOne({ userId })
      .populate("courtId", "name city province type");

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    res.status(200).json({
      success: true,
      data: {
        ...user.toObject(),
        info: userInfo || {},
        clerkDetails: clerkInfo || {},
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching profile",
      error: error.message,
    });
  }
};

export const updateMyProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { dob, city, province, profileImageUrl, fullName, email } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await userBaseModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const hasAccountUpdates = fullName !== undefined || email !== undefined;
    const hasProfileUpdates =
      dob !== undefined ||
      city !== undefined ||
      province !== undefined ||
      profileImageUrl !== undefined ||
      !!req.file;

    if (!hasAccountUpdates && !hasProfileUpdates) {
      return res
        .status(400)
        .json({ success: false, message: "No update data provided" });
    }

    if (fullName !== undefined) {
      const trimmedFullName = fullName.trim();
      if (trimmedFullName.length < 3) {
        return res.status(400).json({
          success: false,
          message: "Name must be at least 3 characters",
        });
      }
      user.fullName = trimmedFullName;
    }

    if (email !== undefined) {
      const trimmedEmail = email.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid email address" });
      }

      if (trimmedEmail !== user.email) {
        const existingUser = await userBaseModel.findOne({
          email: trimmedEmail,
        });
        if (existingUser) {
          return res
            .status(400)
            .json({ success: false, message: "Email is already in use" });
        }
        user.email = trimmedEmail;
      }
    }

    const accountUpdated = hasAccountUpdates;
    let profileUpdated = false;

    // Upsert UserInfo
    let userInfo = await userInfoModel.findOne({ userId });
    if (hasProfileUpdates) {
      if (userInfo) {
        if (dob !== undefined) userInfo.dob = dob;
        if (city !== undefined) userInfo.city = city;
        if (province !== undefined) userInfo.province = province;

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
        profileUpdated = true;
      } else {
        if (!dob || !city || !province) {
          return res.status(400).json({
            success: false,
            message: "dob, city and province are required",
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
        profileUpdated = true;
      }
    }

    if (profileUpdated) {
      user.isProfileComplete = true;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: profileUpdated
        ? accountUpdated
          ? "Account and profile updated successfully"
          : "Profile updated successfully"
        : "Account details updated successfully",
      data: profileUpdated
        ? userInfo
        : { fullName: user.fullName, email: user.email },
      user: {
        ...user.toObject(),
        password: undefined,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message,
    });
  }
};

// --- Court Officers ---
export const getMyCourtOfficers = async (req, res) => {
  try {
    const userId = req.userId;
    const { search, status } = req.query;

    const clerkProfile = await clerkProfileModel.findOne({ userId });

    if (!clerkProfile) {
      return res
        .status(404)
        .json({ success: false, message: "Clerk profile not found" });
    }

    const courtId = clerkProfile.courtId;

    // Find officers in the same court
    // Populate UserBase for name/email/role and isVerified (for status)
    let officers = await courtOfficerProfileModel
      .find({ courtId })
      .populate("userId", "fullName email role isVerified")
      .populate("courtOfficerProfileId", "dob city province"); // Populate details if needed

    if (search) {
      const lowerSearch = search.toLowerCase();
      officers = officers.filter(
        (o) =>
          o.userId?.fullName?.toLowerCase().includes(lowerSearch) ||
          o.userId?.email?.toLowerCase().includes(lowerSearch),
      );
    }

    if (status && status !== "all") {
      const isActive = status.toLowerCase() === "active";
      officers = officers.filter((o) => {
        const officerActive = o.userId?.isVerified || false;
        return officerActive === isActive;
      });
    }

    res.status(200).json({ success: true, data: officers });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching court officers",
      error: error.message,
    });
  }
};
