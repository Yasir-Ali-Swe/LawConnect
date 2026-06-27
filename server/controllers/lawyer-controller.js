import userBaseModel from "../models/user-base-model.js";
import lawyerProfileModel from "../models/lawyer-profile-model.js";
import UserInfoModel from "../models/user-info-model.js";
import proposalModel from "../models/proposal-model.js";
import { replaceProfileImage } from "../utils/profile-image-service.js";

export const createLawyerInfo = async (req, res) => {
  try {
    const userId = req.userId;
    const { dob, city, province, profileImageUrl } = req.body;
    const user = await userBaseModel.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const imageData = await replaceProfileImage({
      file: req.file,
      userId,
      existingUrl: profileImageUrl || null,
      existingPublicId: null,
    });

    const userInfo = new UserInfoModel({
      userId,
      dob,
      city,
      province,
      profileImageUrl: imageData.profileImageUrl,
      profileImagePublicId: imageData.profileImagePublicId,
    });

    await userInfo.save();
    res.status(201).json({
      success: true,
      message: "User info created successfully",
      data: userInfo,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const getPublicLawyers = async (req, res) => {
  try {
    const { city, name, practiceAreas } = req.query;

    // 1. Build userBaseModel query
    const userQuery = {
      role: "lawyer",
      isProfileComplete: true
    };

    if (name) {
      const trimmedName = name.trim();
      if (trimmedName) {
        userQuery.fullName = { $regex: escapeRegex(trimmedName), $options: "i" };
      }
    }

    // Find all users who match userQuery
    const lawyers = await userBaseModel.find(userQuery).select("-password");

    if (!lawyers || lawyers.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const lawyerIds = lawyers.map(l => l._id);

    // 2. Build lawyerProfileModel query
    const profileQuery = { userId: { $in: lawyerIds } };

    if (city) {
      const trimmedCity = city.trim();
      if (trimmedCity) {
        // Find matching UserInfo documents
        const matchingInfos = await UserInfoModel.find({
          city: { $regex: escapeRegex(trimmedCity), $options: "i" }
        }).select("_id");

        const userInfoIds = matchingInfos.map(info => info._id);
        profileQuery.lawyerProfileId = { $in: userInfoIds };
      }
    }

    if (practiceAreas) {
      let areaList = [];
      if (Array.isArray(practiceAreas)) {
        areaList = practiceAreas.map(a => a.trim()).filter(Boolean);
      } else if (typeof practiceAreas === "string") {
        areaList = practiceAreas.split(",").map(a => a.trim()).filter(Boolean);
      }

      if (areaList.length > 0) {
        profileQuery.specialization = { $in: areaList };
      }
    }

    // Fetch LawyerProfiles for these users
    const lawyerProfiles = await lawyerProfileModel.find(profileQuery)
      .populate("lawyerProfileId"); // Populate UserInfo (city, image)

    // 3. Merge Data
    const results = lawyers.map(user => {
      const profile = lawyerProfiles.find(p => p.userId.toString() === user._id.toString());
      const info = profile ? profile.lawyerProfileId : null;

      if (!profile) return null; // Filtered out by city or specialization

      return {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        city: info?.city,
        province: info?.province,
        profileImageUrl: info?.profileImageUrl,
        bio: profile.bio,
        specialization: profile.specialization,
        experience: profile.experience,
      };
    }).filter(Boolean);

    res.status(200).json({
      success: true,
      data: results
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

export const getLawyerInfo = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }
    const lawyerInfo = await UserInfoModel.findOne({ userId }).populate(
      "userId",
      "name email role isVerified isProfileComplete",
    );
    if (!lawyerInfo) {
      return res
        .status(404)
        .json({ success: false, message: "Lawyer info not found" });
    }
    res.status(200).json({
      success: true,
      message: "Lawyer info fetched successfully",
      data: lawyerInfo,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

export const updateLawyerInfo = async (req, res) => {
  try {
    const userId = req.userId;
    const { dob, city, province, profileImageUrl } = req.body;

    const lawyerInfo = await UserInfoModel.findOne({ userId });
    if (!lawyerInfo) {
      return res
        .status(404)
        .json({ success: false, message: "Lawyer info not found" });
    }

    lawyerInfo.dob = dob || lawyerInfo.dob;
    lawyerInfo.city = city || lawyerInfo.city;
    lawyerInfo.province = province || lawyerInfo.province;

    if (profileImageUrl !== undefined) {
      lawyerInfo.profileImageUrl = profileImageUrl;
      if (!profileImageUrl) {
        lawyerInfo.profileImagePublicId = null;
      }
    }

    if (req.file) {
      const imageData = await replaceProfileImage({
        file: req.file,
        userId,
        existingUrl: lawyerInfo.profileImageUrl,
        existingPublicId: lawyerInfo.profileImagePublicId,
      });

      lawyerInfo.profileImageUrl = imageData.profileImageUrl;
      lawyerInfo.profileImagePublicId = imageData.profileImagePublicId;
    }

    await lawyerInfo.save();

    res.status(200).json({
      success: true,
      message: "Lawyer info updated successfully",
      data: lawyerInfo,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

export const createLawyerProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { experience, specialization, barCouncil } = req.body;
    if (!userId || !experience || !specialization || !barCouncil) {
      return res
        .status(400)
        .json({ success: false, message: "All Fields are required" });
    }
    const lawyerInfo = await UserInfoModel.findOne({ userId });
    if (!lawyerInfo) {
      return res.status(404).json({
        success: false,
        message:
          "Please first Complete the lawyer contact information then proceed",
      });
    }
    const lawyerProfile = new lawyerProfileModel({
      userId,
      experience,
      specialization,
      barCouncil,
      lawyerProfileId: lawyerInfo._id,
    });
    if (await lawyerProfile.save()) {
      const user = await userBaseModel.findById(userId);
      user.isProfileComplete = true;
      await user.save();
    }
    res.status(201).json({
      success: true,
      message: "Lawyer Profile created successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

export const getLawyerProfile = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }
    const lawyerProfile = await lawyerProfileModel
      .findOne({ userId })
      .populate("userId", "name email role isVerified isProfileComplete")
      .populate("lawyerProfileId", " dob city province profileImageUrl");

    // If not found, returning 404 is fine, but maybe we want to return null data so frontend knows to show "Start Profile"
    if (!lawyerProfile) {
      return res
        .status(404)
        .json({ success: false, message: "Lawyer profile not found" });
    }
    res.status(200).json({
      success: true,
      message: "Lawyer profile fetched successfully",
      data: lawyerProfile,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

const checkProfileCompletion = async (userId) => {
  const userInfo = await UserInfoModel.findOne({ userId });
  const lawyerProfile = await lawyerProfileModel.findOne({ userId });

  if (
    userInfo &&
    userInfo.dob &&
    userInfo.city &&
    userInfo.province &&
    lawyerProfile &&
    lawyerProfile.experience &&
    lawyerProfile.specialization.length > 0 &&
    lawyerProfile.barCouncil &&
    lawyerProfile.education &&
    lawyerProfile.education.length > 0
  ) {
    await userBaseModel.findByIdAndUpdate(userId, { isProfileComplete: true });
    return true;
  } else {
    // Optionally un-complete if they remove data? Maybe not needed strictly but good practice.
    // await userBaseModel.findByIdAndUpdate(userId, { isProfileComplete: false });
    return false;
  }
};

export const updateLawyerProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { experience, specialization, barCouncil, bio, education } = req.body;

    // Use findOneAndUpdate with upsert option? Or manual check.
    // Spec implies we might be creating it here if it doesn't exist (Professional Details tab).
    // The previous code verified lawyerInfo existence first.

    let lawyerProfile = await lawyerProfileModel.findOne({ userId });

    if (!lawyerProfile) {
      // Check if basic info exists first
      const lawyerInfo = await UserInfoModel.findOne({ userId });
      if (!lawyerInfo) {
        return res.status(404).json({ success: false, message: "Please complete Personal Information first." });
      }
      lawyerProfile = new lawyerProfileModel({
        userId,
        lawyerProfileId: lawyerInfo._id,
        experience: experience || 0, // Default or required
        specialization: specialization || [],
        barCouncil: barCouncil || "Punjab Bar Council", // Default?
        // We should validate required fields if creating new
      });
    }

    if (experience !== undefined) lawyerProfile.experience = experience;
    if (specialization !== undefined) lawyerProfile.specialization = specialization;
    if (barCouncil !== undefined) lawyerProfile.barCouncil = barCouncil;
    if (bio !== undefined) lawyerProfile.bio = bio;
    if (education !== undefined) lawyerProfile.education = education;

    await lawyerProfile.save();

    // Check completion status
    const isComplete = await checkProfileCompletion(userId);

    res.status(200).json({
      success: true,
      message: "Lawyer profile updated successfully",
      isProfileComplete: isComplete
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

export const updateProposalStatus = async (req, res) => {
  try {
    const { proposalId, status } = req.body;
    const lawyerId = req.userId.toString();

    if (!proposalId || !status) {
      return res.status(400).json({
        success: false,
        message: "Proposal ID and status are required",
      });
    }

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'accepted' or 'rejected'",
      });
    }

    const proposal = await proposalModel.findById(proposalId);

    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: "Proposal not found",
      });
    }

    if (proposal.lawyerId.toString() !== lawyerId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this proposal",
      });
    }

    proposal.status = status;
    const updatedProposal = await proposal.save();

    res.status(200).json({
      success: true,
      message: `Proposal ${status} successfully`
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};


export const getLawyerProposals = async (req, res) => {
  try {
    const lawyerId = req.userId;
    const { status } = req.query;


    if (!lawyerId) {
      return res.status(400).json({
        success: false,
        message: "Lawyer ID is required",
      });
    }
    const query = { lawyerId };
    if (status) {
      query.status = status;
    }

    const proposals = await proposalModel
      .find(query)
      .populate("clientId", "fullName email")
      .sort({ createdAt: -1 });

    if (!proposals || proposals.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No proposals found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Proposals fetched successfully",
      data: proposals,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};


export const completeProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { dob, city, province, profileImageUrl } = req.body;

    if (!userId || !dob || !city || !province) {
      // profileImageUrl might be optional? Prompt says it's required.
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // 1. Create/Update User Info
    let userInfo = await UserInfoModel.findOne({ userId });

    const imageData = await replaceProfileImage({
      file: req.file,
      userId,
      existingUrl: userInfo?.profileImageUrl || profileImageUrl || null,
      existingPublicId: userInfo?.profileImagePublicId || null,
    });

    if (userInfo) {
      userInfo.dob = dob;
      userInfo.city = city;
      userInfo.province = province;
      userInfo.profileImageUrl = imageData.profileImageUrl;
      userInfo.profileImagePublicId = imageData.profileImagePublicId;
      await userInfo.save();
    } else {
      userInfo = new UserInfoModel({
        userId,
        dob,
        city,
        province,
        profileImageUrl: imageData.profileImageUrl,
        profileImagePublicId: imageData.profileImagePublicId,
      });
      await userInfo.save();
    }

    // 2. Check and Update Profile Completion Status

    // We do NOT automatically set it to true anymore. We check if all parts are there.
    // Since this is usually Step 1, it will likely return false, which is correct.
    const isComplete = await checkProfileCompletion(userId);

    // Retrieve latest user state (checkProfileCompletion updates the DB if true)
    const user = await userBaseModel.findById(userId);

    res.status(200).json({
      success: true,
      message: "Personal information saved successfully",
      user: user,
      isProfileComplete: isComplete,
      data: userInfo,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

export const updateLawyerAccount = async (req, res) => {
  try {
    const userId = req.userId;
    const { fullName, email } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await userBaseModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (fullName) user.fullName = fullName;

    if (email && email !== user.email) {
      const existingUser = await userBaseModel.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ success: false, message: "Email is already in use" });
      }
      user.email = email;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Account details updated successfully",
      data: {
        fullName: user.fullName,
        email: user.email
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};
