import { ApiError } from "../utils/ApiError.js";

const errorMiddleware = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log the error for debugging (optional, but good practice)
  // console.error(err);

  // Check if it's an instance of ApiError
  if (err instanceof ApiError) {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Something went wrong. Please try again.";
    const errorCode = err.errorCode;

    return res.status(statusCode).json({
      success: false,
      message,
      ...(errorCode && { errorCode }),
    });
  }

  // Handle Generic Error with status (e.g. from utils)
  if (err.status) {
    return res.status(err.status).json({
      success: false,
      message: err.message || "Something went wrong.",
    });
  }

  // Handle Mongoose Bad ObjectId
  if (err.name === "CastError") {
    const message = `Resource not found. Invalid: ${err.path}`;
    return res.status(404).json({
      success: false,
      message,
    });
  }

  // Handle Mongoose Validation Error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    return res.status(400).json({
      success: false,
      message,
    });
  }

  // Handle Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
    return res.status(400).json({
      success: false,
      message,
    });
  }

  // Handle JWT Error
  if (err.name === "JsonWebTokenError") {
    const message = "Json Web Token is invalid, Try again";
    return res.status(400).json({
      success: false,
      message,
    });
  }

  // Handle JWT Expired Error
  if (err.name === "TokenExpiredError") {
    const message = "Json Web Token is Expired, Try again";
    return res.status(400).json({
      success: false,
      message,
    });
  }

  // Fallback for unknown errors
  return res.status(500).json({
    success: false,
    message: "Something went wrong. Please try again.",
  });
};

export default errorMiddleware;
