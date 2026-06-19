import { getUserFromToken } from "../utils/make-jwt.js";

export const verifyToken = async (req, res, next) => {
    try {
        const token = req.cookies?.authToken;
        if (!token) {
            return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
        }

        const user = await getUserFromToken(token);

        // Verify that user exists? getUserFromToken likely does it or returns user object.
        // Client middleware assumes it returns user.

        req.user = user;
        req.userId = user._id;
        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error.message);
        res.status(401).json({ success: false, message: "Unauthorized: Invalid or expired token" });
    }
};
