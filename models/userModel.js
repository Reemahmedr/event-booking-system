import mongoose from "mongoose";
import userRoles from "../utils/userRoles.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: [userRoles.ADMIN, userRoles.USER],
      default: userRoles.USER,
    },
    avatar: {
      type: String,
      default: "/uploads/download (1).jpg",
    },
  },
  {
    versionKey: false,
  },
);

export const User = mongoose.model("User", userSchema);
