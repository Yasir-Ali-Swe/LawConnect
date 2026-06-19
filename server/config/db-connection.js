import mongoose from "mongoose";
import { DB_CONNECTION } from "./env.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(DB_CONNECTION);
    console.log("Database connected successfully");
  } catch (error) {
    console.log("Database connection error:", error.message);
  }
};
