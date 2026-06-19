import { getUserFromToken } from "../utils/make-jwt.js";

export const clientMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies?.authToken;
    const user = await getUserFromToken(token);
    if (user.role !== "client") {
      return res.status(403).json({ success: false, message: "Access denied. Clients only." });
    }
    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};
