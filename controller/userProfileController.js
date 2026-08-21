import { User } from "../models/userModel.js";
import httpStatusText from "../utils/httpStatusText.js";
import asyncWrapper from "../middleware/asyncWrapper.js";
import bcrypt from "bcrypt";
import { Booking } from "../models/bookingModel.js";
import saveForLater from "../models/saveForLaterModel.js";
import mongoose from "mongoose";

async function getProfile(req, res, next) {
  const userId = req.user._id;
  const userExists = await User.findOne({ _id: userId }).select("-password");
  if (!userExists) {
    return res
      .status(404)
      .json({ status: httpStatusText.FAIL, message: "User not found" });
  }
  return res
    .status(200)
    .json({ status: httpStatusText.SUCCESS, data: { userExists } });
}

async function updateProfile(req, res, next) {
  const { name } = req.body;
  const userId = req.user._id;

  const updateData = {};

  if (name) {
    updateData.name = name;
  }

  if (req.file) {
    updateData.avatar = req.file.filename;
  }
  const userExists = await User.findOneAndUpdate(
    { _id: userId },
    { $set: updateData },
    { new: true },
  );
  if (!userExists) {
    return res
      .status(404)
      .json({ status: httpStatusText.FAIL, message: "User not found" });
  }
  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Your profile is updated successfully",
    data: {
      userExists,
    },
  });
}

async function changePassword(req, res, next) {
  const userId = req.user._id;
  const { password, currentPassword } = req.body;
  if (!password || !currentPassword) {
    return res.status(400).json({
      status: httpStatusText.ERROR,
      message: "All fields are required",
    });
  }
  const user = await User.findOne({ _id: userId });
  if (!user) {
    return res.status(404).json({
      status: httpStatusText.FAIL,
      message: "User not found",
    });
  }
  const checkForCurrentPassword = await bcrypt.compare(
    currentPassword,
    user.password,
  );
  if (!checkForCurrentPassword) {
    return res.status(400).json({
      status: httpStatusText.ERROR,
      message: "Wrong password , try again",
    });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const userPassword = await User.findOneAndUpdate(
    { _id: userId },
    { $set: { password: hashedPassword } },
    { new: true },
  );
  if (!userPassword) {
    return res.status(404).json({
      status: httpStatusText.FAIL,
      message: "User not found",
    });
  }
  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Your password is updated successfully",
  });
}

async function deleteAccount(req, res, next) {
  const userId = req.user._id;
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({
      status: httpStatusText.ERROR,
      message: "All fields are required",
    });
  }
  const user = await User.findOne({ _id: userId });
  if (!user) {
    return res
      .status(404)
      .json({ status: httpStatusText.FAIL, message: "User not found" });
  }
  if (!user.password) {
    return res.status(400).json({
      status: httpStatusText.ERROR,
      message: "This account does not have a password",
    });
  }
  const comparePassword = await bcrypt.compare(password, user.password);
  if (!comparePassword) {
    return res
      .status(400)
      .json({ status: httpStatusText.ERROR, message: "Wrong password" });
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    await Booking.deleteMany({ user: userId }, { session });

    await saveForLater.deleteMany({ user: userId }, { session });

    const deletedUser = await User.findByIdAndDelete(userId, { session });

    if (!deletedUser) {
      throw new Error("User not found");
    }

    await session.commitTransaction();
    return res.status(200).json({
      status: httpStatusText.SUCCESS,
      message: "Your account deleted successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
}

export default {
  getProfile: asyncWrapper(getProfile),
  updateProfile: asyncWrapper(updateProfile),
  changePassword: asyncWrapper(changePassword),
  deleteAccount: asyncWrapper(deleteAccount),
};
