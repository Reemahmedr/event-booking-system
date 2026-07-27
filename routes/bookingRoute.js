import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import bookingController from "../controller/bookingController.js";
import allowedTo from "../middleware/allowedTo.js";
import userRoles from "../utils/userRoles.js";

const router = express.Router();
router.post(
  "/:id",
  verifyToken,
  allowedTo(userRoles.USER),
  bookingController.bookEvent,
);
router.get(
  "/:id",
  verifyToken,
  allowedTo(userRoles.USER),
  bookingController.getMyBooking,
);
router.delete(
  "/:id",
  verifyToken,
  allowedTo(userRoles.USER),
  bookingController.cancelBooking,
);
router.patch(
  "/:id",
  verifyToken,
  allowedTo(userRoles.USER),
  bookingController.updateBooking,
);

export default router;
