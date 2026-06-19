import userInfo from "../models/user-info-model.js";
import userBase from "../models/user-base-model.js";
import courtModel from "../models/court-model.js";
import clerkProfileModel from "../models/clerk-profile-model.js";
import courtOfficerProfileModel from "../models/court-officer-profile-model.js";
import { replaceProfileImage } from "../utils/profile-image-service.js";
import { generateJWT } from "../utils/make-jwt.js";
import { FRONTEND_URL } from "../config/env.js";
import { sendEmail } from "../utils/email-service.js";
import { setupPasswordEmailTemplate } from "../utils/email-templates/setup-password-email-template.js";
import bcrypt from "bcryptjs";

export const createProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { dob, city, province, profileImageUrl } = req.body;
    if (!userId || !dob || !city || !province) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // 1. Ensure User Base status is updated (Critical fix)
    const user = await userBase.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    user.isProfileComplete = true;
    await user.save();

    // 2. Upsert Profile (Update if exists, Create if new)
    let adminProfile = await userInfo.findOne({ userId });

    const imageData = await replaceProfileImage({
      file: req.file,
      userId,
      existingUrl: adminProfile?.profileImageUrl || profileImageUrl || null,
      existingPublicId: adminProfile?.profileImagePublicId || null,
    });

    if (adminProfile) {
      // Profile exists, update it instead of crashing
      adminProfile.dob = dob;
      adminProfile.city = city;
      adminProfile.province = province;
      adminProfile.profileImageUrl = imageData.profileImageUrl;
      adminProfile.profileImagePublicId = imageData.profileImagePublicId;
      await adminProfile.save();
      return res.status(200).json({
        success: true,
        message: "Profile updated and verified successfully",
        data: adminProfile,
      });
    } else {
      // Create new
      adminProfile = new userInfo({
        userId,
        dob,
        city,
        province,
        profileImageUrl: imageData.profileImageUrl,
        profileImagePublicId: imageData.profileImagePublicId,
      });
      await adminProfile.save();
      return res.status(200).json({
        success: true,
        message: "Profile created successfully",
        data: adminProfile,
      });
    }
  } catch (error) {
    console.error("Error in createProfile:", error);
    // Handle duplicate key error explicitly just in case
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Profile already exists",
        error: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: "Error creating profile",
      error: error.message,
    });
  }
};

export const adminUpdateHisProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { dob, city, province, profileImageUrl } = req.body;
    if (!userId) {
      res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }
    const existingProfile = await userInfo.findOne({ userId });
    if (!existingProfile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    if (dob) existingProfile.dob = dob;
    if (city) existingProfile.city = city;
    if (province) existingProfile.province = province;

    if (profileImageUrl !== undefined) {
      existingProfile.profileImageUrl = profileImageUrl;
      if (!profileImageUrl) {
        existingProfile.profileImagePublicId = null;
      }
    }

    if (req.file) {
      const imageData = await replaceProfileImage({
        file: req.file,
        userId,
        existingUrl: existingProfile.profileImageUrl,
        existingPublicId: existingProfile.profileImagePublicId,
      });

      existingProfile.profileImageUrl = imageData.profileImageUrl;
      existingProfile.profileImagePublicId = imageData.profileImagePublicId;
    }

    const updatedProfile = await existingProfile.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedProfile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error,
    });
  }
};

export const adminUpdateAccount = async (req, res) => {
  try {
    const userId = req.userId;
    const { fullName, email } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await userBase.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (fullName) user.fullName = fullName;

    if (email && email !== user.email) {
      const existingUser = await userBase.findOne({ email });
      if (existingUser) {
        return res
          .status(400)
          .json({ success: false, message: "Email is already in use" });
      }
      user.email = email;
    }

    /* Password update implementation if needed - omitted for now as typically requires hash */

    await user.save();

    res.status(200).json({
      success: true,
      message: "Account updated successfully",
      data: {
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating account",
      error: error.message,
    });
  }
};

export const adminGetHisProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const profile = await userInfo
      .findOne({ userId })
      .populate("userId", "fullName email role");
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error getting profile",
      error: error,
    });
  }
};

export const adminCreateCourt = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, type, city, province } = req.body;
    if (!userId || !name || !type || !city || !province) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const newCourt = new courtModel({
      name,
      type,
      city,
      province,
      createdBy: userId,
    });

    await newCourt.save();

    return res.status(201).json({
      success: true,
      message: "Court created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating court",
      error: error,
    });
  }
};

export const getAllCourts = async (req, res) => {
  try {
    const userId = req.userId;
    const { search, province, type } = req.query;

    const query = { createdBy: userId };

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }
    if (province && province !== "all") {
      query.province = province;
    }
    if (type && type !== "all") {
      query.type = type;
    }

    const courts = await courtModel
      .find(query)
      .populate("createdBy", "fullName email role")
      .populate("clerkId", "fullName email"); // Add clerk population as it might be useful

    if (courts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Courts not found",
        courts: [], // Return empty array so frontend map doesn't fail
      });
    }
    return res.status(200).json({
      success: true,
      message: "Courts fetched successfully",
      courts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error getting courts",
      error: error.message,
    });
  }
};

export const getCourtById = async (req, res) => {
  try {
    const userId = req.userId;
    const courtId = req.params.courtId;
    const court = await courtModel
      .findOne({ createdBy: userId, _id: courtId })
      .populate("createdBy", "fullName email role")
      .populate("clerkId", "fullName email"); // Populate Clerk Info

    if (!court) {
      return res.status(404).json({
        success: false,
        message: "Court not found",
      });
    }

    // Fetch Assigned Officers
    const officers = await courtOfficerProfileModel
      .find({ courtId })
      .populate("userId", "fullName email");

    return res.status(200).json({
      success: true,
      message: "Court fetched successfully",
      court,
      assignedOfficers: officers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error getting court",
      error: error,
    });
  }
};

export const adminCreateInternalUser = async (req, res) => {
  try {
    const { fullName, email, dob, city, province, role, password } = req.body;
    if (
      !fullName ||
      !email ||
      !dob ||
      !city ||
      !province ||
      !role ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    const userExist = await userBase.findOne({ email });
    if (userExist) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const clerk = new userBase({
      fullName,
      email,
      password: hashedPassword,
      isVerified: true,
      isProfileComplete: role === "court_officer" ? false : true,
      role,
    });
    await clerk.save();
    const clerkProfile = new userInfo({
      userId: clerk._id,
      dob,
      city,
      province,
    });
    await clerkProfile.save();

    const setupToken = generateJWT(
      clerk._id,
      "24h",
      "passwordSetup",
      clerk.tokenVersion,
    );
    const setupUrl = `${FRONTEND_URL}/login`;
    const emailContent = setupPasswordEmailTemplate({
      name: fullName,
      link: setupUrl,
      title: "Welcome to LawConnect",
      message: `
    <p>Your account has been created by the administrator. Use this email and password to login to your account.</p>

    <p>
      <strong>Email:</strong> <b>${email}</b><br>
      <strong>Password:</strong> <b>${password}</b>
    </p>

    <p>Please change your password immediately after logging in for security reasons.</p>
  `,
    });
    await sendEmail({
      to: email,
      subject: "Your Account Credentials - LawConnect",
      html: emailContent,
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully. Password setup link sent via email.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating user",
      error: error.message,
    });
  }
};

export const adminGetAllInternalUsers = async (req, res) => {
  try {
    const { role, search, location } = req.query;

    // Build query
    const query = {};
    if (role && role !== "all") {
      query.role = role;
    }
    if (search) {
      query.fullName = { $regex: search, $options: "i" };
    }

    const internalUsers = await userBase.find(query);

    // Fetch profiles
    let internalUserProfiles = await Promise.all(
      internalUsers.map(async (internalUser) => {
        const profile = await userInfo
          .findOne({ userId: internalUser._id })
          .populate("userId", "fullName email role");

        return {
          ...internalUser.toObject(),
          profile: profile || null,
        };
      }),
    );

    // Filter by location if provided
    if (location) {
      const lowerLoc = location.toLowerCase();
      internalUserProfiles = internalUserProfiles.filter((user) => {
        const city = user.profile?.city?.toLowerCase() || "";
        const province = user.profile?.province?.toLowerCase() || "";
        return city.includes(lowerLoc) || province.includes(lowerLoc);
      });
    }

    if (internalUserProfiles.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No users found", data: [] });
    }

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: internalUserProfiles,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error getting users",
      error: error.message,
    });
  }
};

export const adminGetInternalUserById = async (req, res) => {
  try {
    const { internalUserId } = req.params;
    const internalUser = await userBase.findOne({
      _id: internalUserId,
      role: { $in: ["clerk", "court_officer"] },
    });
    if (!internalUser) {
      return res
        .status(404)
        .json({ success: false, message: "Internal user not found" });
    }
    const profile = await userInfo
      .findOne({ userId: internalUser._id })
      .populate("userId", "fullName email role");

    return res.status(200).json({
      success: true,
      message: "Internal user fetched successfully",
      internalUser: {
        ...internalUser.toObject(),
        profile: profile || null,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error getting internal user by id",
      error: error,
    });
  }
};

export const adminAssigneClerkToCourt = async (req, res) => {
  try {
    const { clerkId, courtId } = req.body;
    const clerk = await userBase.findOne({ _id: clerkId, role: "clerk" });
    const court = await courtModel.findOne({ _id: courtId });
    if (!clerk) {
      return res
        .status(404)
        .json({ success: false, message: "Clerk  not found" });
    }
    if (!court) {
      return res
        .status(404)
        .json({ success: false, message: "Court not found" });
    }

    const clerkProfile = await clerkProfileModel.findOne({ userId: clerkId });
    if (clerkProfile) {
      return res
        .status(404)
        .json({ success: false, message: "Clerk already assigned to court" });
    }

    const clerkInfoId = await userInfo.findOne({ userId: clerkId });
    if (!clerkInfoId) {
      return res
        .status(404)
        .json({ success: false, message: "Clerk info not found" });
    }

    court.clerkId = clerkId;
    await court.save();

    const newClerkProfile = new clerkProfileModel({
      userId: clerkId,
      courtId: courtId,
      clerkProfileId: clerkInfoId._id,
      designation: "Clerk",
    });
    await newClerkProfile.save();
    return res
      .status(200)
      .json({ success: true, message: "Clerk assigned to court successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error assigning clerk to court",
      error: error,
    });
  }
};

export const getClerkProfile = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User id is required" });
    }
    const clerkProfile = await clerkProfileModel
      .findOne({ userId: userId })
      .populate("userId", "fullName email role")
      .populate("courtId", "name type city province")
      .populate("clerkProfileId", "dob city province");
    if (!clerkProfile) {
      return res
        .status(404)
        .json({ success: false, message: "Clerk profile not found" });
    }
    return res.status(200).json({
      success: true,
      message: "Clerk profile fetched successfully",
      clerkProfile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error getting clerk profile",
      error: error,
    });
  }
};

export const adminAssigneCourtOfficerToCourt = async (req, res) => {
  try {
    const { userId, courtId } = req.body;
    if (!userId || !courtId) {
      return res
        .status(400)
        .json({ success: false, message: "User id and court id are required" });
    }
    const court = await courtModel.findById(courtId);
    if (!court) {
      return res
        .status(404)
        .json({ success: false, message: "Court not found" });
    }
    const courtOfficerProfile = await courtOfficerProfileModel.findOne({
      userId: userId,
    });
    if (courtOfficerProfile) {
      return res.status(404).json({
        success: false,
        message: "Court officer already assigned to court",
      });
    }
    const courtOfficerInfoId = await userInfo.findOne({ userId: userId });
    if (!courtOfficerInfoId) {
      return res
        .status(404)
        .json({ success: false, message: "Court officer info not found" });
    }
    court.courtOfficerId = userId;
    await court.save();
    const newCourtOfficerProfile = new courtOfficerProfileModel({
      userId: userId,
      courtId: courtId,
      courtOfficerProfileId: courtOfficerInfoId._id,
      designation: "Court Officer",
    });
    await newCourtOfficerProfile.save();
    return res.status(200).json({
      success: true,
      message: "Court officer assigned to court successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error assigning court officer to court",
      error: error,
    });
  }
};

export const getCourtOfficerProfile = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User id is required" });
    }
    const courtOfficerProfile = await courtOfficerProfileModel
      .findOne({ userId: userId })
      .populate("userId", "fullName email role")
      .populate("courtId", "name type city province")
      .populate("courtOfficerProfileId", "dob city province");
    if (!courtOfficerProfile) {
      return res
        .status(404)
        .json({ success: false, message: "Court officer profile not found" });
    }
    return res.status(200).json({
      success: true,
      message: "Court officer profile fetched successfully",
      courtOfficerProfile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error getting court officer profile",
      error: error.message,
    });
  }
};

export const adminGetAllCourtOfficers = async (req, res) => {
  try {
    const courtOfficers = await courtOfficerProfileModel
      .find()
      .populate("userId", "fullName email role")
      .populate("courtId", "name type city province")
      .populate("courtOfficerProfileId", "dob city province");
    if (courtOfficers.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Court officers not found" });
    }
    return res.status(200).json({
      success: true,
      message: "Court officers fetched successfully",
      courtOfficers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error getting court officers",
      error: error.message,
    });
  }
};

export const getUnassignedClerks = async (req, res) => {
  try {
    // 1. Get all users with role 'clerk'
    const allClerks = await userBase.find({ role: "clerk" });

    // 2. Get all assigned clerk User IDs from ClerkProfile
    const assignedprofiles = await clerkProfileModel.find({}, "userId");
    const assignedIds = assignedprofiles.map((p) => p.userId.toString());

    // 3. Filter out assigned clerks
    const unassignedClerks = allClerks.filter(
      (user) => !assignedIds.includes(user._id.toString()),
    );

    return res.status(200).json({
      success: true,
      data: unassignedClerks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching unassigned clerks",
      error: error.message,
    });
  }
};

export const getUnassignedCourtOfficers = async (req, res) => {
  try {
    // 1. Get all users with role 'court_officer'
    const allOfficers = await userBase.find({ role: "court_officer" });

    // 2. Get all assigned officer User IDs
    // Note: Officers can technically have multiple assignments if the model allows,
    // but current schema enforces unique userId in CourtOfficerProfileModel (line 8: unique: true).
    // So an officer can only be in ONE court.
    const assignedProfiles = await courtOfficerProfileModel.find({}, "userId");
    const assignedIds = assignedProfiles.map((p) => p.userId.toString());

    // 3. Filter
    const unassignedOfficers = allOfficers.filter(
      (user) => !assignedIds.includes(user._id.toString()),
    );

    return res.status(200).json({
      success: true,
      data: unassignedOfficers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching unassigned officers",
      error: error.message,
    });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    // 1. KPI Counts
    const totalCourts = await courtModel.countDocuments();
    const totalClerks = await userBase.countDocuments({ role: "clerk" });
    const totalOfficers = await userBase.countDocuments({
      role: "court_officer",
    });
    const totalUsers = totalClerks + totalOfficers;

    // 2. Assignment Health
    const courtsWithoutClerk = await courtModel.countDocuments({
      clerkId: null,
    });
    // Courts with at least one officer
    const courtsWithOfficersIds =
      await courtOfficerProfileModel.distinct("courtId");
    const courtsWithOfficersCount = courtsWithOfficersIds.length;
    const courtsWithoutOfficers = totalCourts - courtsWithOfficersCount;

    // 3. Recent Activity (Last 5)
    const recentCourts = await courtModel
      .find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("createdBy", "fullName");
    const recentUsers = await userBase
      .find({ role: { $in: ["clerk", "court_officer"] } })
      .sort({ createdAt: -1 })
      .limit(5);

    // 4. Chart Data: Courts by Province
    const courtsByProvince = await courtModel.aggregate([
      { $group: { _id: "$province", count: { $sum: 1 } } },
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalCourts,
        totalClerks,
        totalOfficers,
        totalUsers,
        courtsWithoutClerk,
        courtsWithOfficersCount,
        courtsWithoutOfficers,
      },
      recentActivity: {
        recentCourts,
        recentUsers,
      },
      charts: {
        courtsByProvince,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard stats",
      error: error.message,
    });
  }
};
