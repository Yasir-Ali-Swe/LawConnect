import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";
import User from "../models/user-base-model.js";

export const generateJWT = (
  id,
  expiredAt,
  purpose = "auth",
  tokenVersion = 0,
) => {
  return jwt.sign({ id, purpose, tokenVersion }, JWT_SECRET, {
    expiresIn: expiredAt,
  });
};

export const getUserFromToken = async (token, expectedPurpose = "auth") => {
  if (!token) {
    const error = new Error("No token provided");
    error.status = 401;
    throw error;
  }
  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError") {
      const error = new Error("Invalid or expired token");
      error.status = 401;
      throw error;
    }
    throw err;
  }
  if (decoded.purpose !== expectedPurpose) {
    const error = new Error("Invalid token purpose");
    error.status = 401;
    throw error;
  }
  const user = await User.findById(decoded.id);
  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }
  if (user.tokenVersion !== decoded.tokenVersion) {
    const error = new Error("Token has been revoked");
    error.status = 401;
    throw error;
  }
  return user;
};
