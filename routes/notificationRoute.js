import express from "express";
import notificationController from "../controller/notificationController.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/", verifyToken, notificationController.getNotification);
router.patch("/:id", verifyToken, notificationController.oneNotificationIsRead);
router.patch("/", verifyToken, notificationController.allNotificationsIsRead);
router.delete("/:id", verifyToken, notificationController.deleteNotification);

export default router;
