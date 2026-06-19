import { getUserFromToken } from "../utils/make-jwt.js";

export const isProfileComplete = async (req, res, next) => {
  try {
    const token = req.cookies?.authToken;
    const user = await getUserFromToken(token);
    if (!user.isProfileComplete) {
      return res
        .status(400)
        .json({ message: "Please complete your profile to proceed." });
    }
    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};
