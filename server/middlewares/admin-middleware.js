import { getUserFromToken } from "../utils/make-jwt.js";

export const adminMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies?.authToken;
    const user = await getUserFromToken(token);
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }
    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};
