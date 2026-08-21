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
      trim: true,
      minlength: 6,
      required: function () {
        return !this.googleId;
      },
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
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
    resetPasswordToken: {
      type: String,
      default: null,
      select: false,
    },

    resetPasswordExpire: {
      type: Date,
      default: null,
      select: false,
    },
  },
  {
    versionKey: false,
  },
);

userSchema.index({ email: 1 });

export const User = mongoose.model("User", userSchema);
