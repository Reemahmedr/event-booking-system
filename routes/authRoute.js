import express from "express";
import authController from "../controller/authController.js";
import uploads from "../middleware/uploadImage.js";
import validate from "../middleware/validatation.js";
import authSchema from "../schema/auth.schema.js";
import { loginLimiter, registerLimiter } from "../middleware/rate-limiter.js";

const router = express.Router();

router.post(
  "/register",
  uploads.single("avatar"),
  validate(authSchema.registerSchema),
  registerLimiter,
  authController.register,
);
router.post(
  "/login",
  validate(authSchema.loginSchema),
  loginLimiter,
  authController.login,
);

export default router;
