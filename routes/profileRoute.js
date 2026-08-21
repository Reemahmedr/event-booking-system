import express from "express";
import userProfileController from "../controller/userProfileController.js";
import verifyToken from "../middleware/verifyToken.js";
import profileSchema from "../schema/user.schema.js";
import validate from "../middleware/validatation.js";
import uploads from "../middleware/uploadImage.js";

const router = express.Router();
router.get("/profile", verifyToken, userProfileController.getProfile);
router.patch(
  "/profile",
  verifyToken,
  uploads.single("avatar"),
  validate(profileSchema.updateProfileSchema),
  userProfileController.updateProfile,
);
router.patch(
  "/profile/change-password",
  verifyToken,
  validate(profileSchema.changePasswordSchema),
  userProfileController.changePassword,
);

router.delete("/profile", verifyToken, userProfileController.deleteAccount);
export default router;
