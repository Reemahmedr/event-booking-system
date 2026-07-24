import asyncWrapper from "../middleware/asyncWrapper.js";
import { User } from "../models/userModel.js";
import bcrypt from "bcrypt";
import httpStatusText from "../utils/httpStatusText.js";
import JWT from "../utils/JWT.js";

async function register(req, res, next) {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({
      status: httpStatusText.ERROR,
      message: "All fields are required",
    });
  }
  const emailExists = await User.findOne({ email });
  if (password.length < 6) {
    return res.status(400).json({
      status: httpStatusText.FAIL,
      message: "Password must be 6 or more",
    });
  }
  if (emailExists) {
    return res
      .status(400)
      .json({ status: httpStatusText.ERROR, message: "Email already exists" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
  });
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
  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      message: "login successfully",
      token: JWT({ _id: emailExists.id, email: emailExists.email }),
    },
  });
}

export default {
  register: asyncWrapper(register),
  login: asyncWrapper(login),
};
