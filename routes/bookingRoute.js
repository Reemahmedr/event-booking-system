import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import bookingController from "../controller/bookingController.js";
import allowedTo from "../middleware/allowedTo.js";
import userRoles from "../utils/userRoles.js";
import validate from "../middleware/validatation.js";
import bookingSchema from "../schema/booking.schema.js";
import { bookingLimiter } from "../middleware/rate-limiter.js";

const router = express.Router();
router.post(
  "/:id",
  verifyToken,
  validate(bookingSchema.createBookingSchema),
  allowedTo(userRoles.USER),
  bookingLimiter,
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
  validate(bookingSchema.updateBookingSchema),
  allowedTo(userRoles.USER),
  bookingController.updateBooking,
);

export default router;
