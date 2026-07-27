import express from "express";
import authController from "../controller/authController.js";
import uploads from "../middleware/uploadImage.js";

const router = express.Router();

router.post("/register", uploads.single("avatar"), authController.register);
router.post("/login", authController.login);

export default router;
