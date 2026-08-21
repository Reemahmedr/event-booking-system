import asyncWrapper from "../middleware/asyncWrapper.js";
import { User } from "../models/userModel.js";
import bcrypt from "bcrypt";
import httpStatusText from "../utils/httpStatusText.js";
import JWT from "../utils/JWT.js";
import deleteFile from "../utils/deleteFile.js";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";

async function register(req, res, next) {
  const { name, email, password, role } = req.body;
  const emailExists = await User.findOne({ email });
  if (emailExists) {
    deleteFile(req.file?.path);
    return res
      .status(400)
      .json({ status: httpStatusText.ERROR, message: "Email already exists" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const avatar = req.file ? req.file.filename : "/uploads/download (1).jpg";
  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
    avatar,
  });

  res.status(201).json({
    status: httpStatusText.SUCCESS,
    data: {
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        avatar: newUser.avatar,
      },
    },
  });
}

async function login(req, res, next) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ status: httpStatusText.FAIL, message: "All fileds are requied" });
  }

  const emailExists = await User.findOne({ email });

  if (!emailExists) {
    return res.status(401).json({
      status: httpStatusText.FAIL,
      message: "Invalid email or password",
    });
  }

  const correctPassword = await bcrypt.compare(password, emailExists.password);
  if (correctPassword == false) {
    return res.status(401).json({
      status: httpStatusText.ERROR,
      message: "password is not correct",
    });
  }
  const token = JWT({
    _id: emailExists._id,
    email: emailExists.email,
    role: emailExists.role,
  });
  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      message: "login successfully",
      token,
    },
  });
}

async function forgetPassword(req, res, next) {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({
      status: httpStatusText.ERROR,
      message: "You have to enter all data",
    });
  }
  const emailExists = await User.findOne({ email });
  if (!emailExists) {
    return res
      .status(404)
      .json({ status: httpStatusText.FAIL, message: "Email not found" });
  }
  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  emailExists.resetPasswordToken = hashedToken;
  emailExists.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  await emailExists.save();
  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  await sendEmail(
    emailExists.email,
    "Reset Password",
    `Click here to reset your password: ${resetLink}`,
  );

  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Directed to reset password successfully",
  });
}

async function resetPassword(req, res, next) {
  const { token } = req.params;
  const { newPassword, confirmPassword } = req.body;
  if (!newPassword || !confirmPassword) {
    return res.status(400).json({
      status: httpStatusText.FAIL,
      message: "You have to enter all fileds",
    });
  }
  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      status: httpStatusText.FAIL,
      message: "new password must be equal to confirm password",
    });
  }
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({ resetPasswordToken: hashedToken });
  if (!user) {
    return res.status(404).json({
      status: httpStatusText.FAIL,
      message: "This token not found",
    });
  }
  if (user.resetPasswordExpire < Date.now()) {
    return res
      .status(400)
      .json({ status: httpStatusText.FAIL, message: "Expired Token" });
  }
  const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedNewPassword;
  user.resetPasswordToken = null;
  user.resetPasswordExpire = null;
  await user.save();
  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Password changed successfully",
  });
}
async function getCurrentUser(req, res) {
  const user = await User.findById(req.user.id).select("-password");

  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: user,
  });
}

export default {
  register: asyncWrapper(register),
  login: asyncWrapper(login),
  forgetPassword: asyncWrapper(forgetPassword),
  resetPassword: asyncWrapper(resetPassword),
  getCurrentUser: asyncWrapper(getCurrentUser),
};
