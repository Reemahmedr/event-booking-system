import asyncWrapper from "../middleware/asyncWrapper.js";
import { User } from "../models/userModel.js";
import bcrypt from "bcrypt";
import httpStatusText from "../utils/httpStatusText.js";
import JWT from "../utils/JWT.js";
import deleteFile from "../utils/deleteFile.js";

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
  console.log(req.body);
  
  res.status(201).json({ status: httpStatusText.SUCCESS, data: { newUser } });
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

export default {
  register: asyncWrapper(register),
  login: asyncWrapper(login),
};
