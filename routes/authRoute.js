import express from "express";
import authController from "../controller/authController.js";
import uploads from "../middleware/uploadImage.js";
import validate from "../middleware/validatation.js";
import authSchema from "../schema/auth.schema.js";
import { loginLimiter, registerLimiter } from "../middleware/rate-limiter.js";
import passport from "../config/passport.js";
import JWT from "../utils/JWT.js";

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
  loginLimiter,
  validate(authSchema.loginSchema),
  authController.login,
);
router.post("/forget-password", authController.forgetPassword);
router.post("/reset-password/:token", authController.resetPassword);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const token = JWT({
      id: req.user._id,
      email: req.user.email,
      role: req.user.role,
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", //http so false when deployment it should be true as it will be https
      sameSite: "lax",
      maxAge: 60 * 60 * 1000,
    });
    res.redirect(process.env.FRONTEND_URL);
  },
);

export default router;
