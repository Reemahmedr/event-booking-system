import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import bookingController from "../controller/bookingController.js";

const router = express.Router();
router.post("/:id", verifyToken, bookingController.bookEvent);
router.get("/:id", verifyToken, bookingController.getMyBooking);
router.delete("/:id", verifyToken, bookingController.cancelBooking);
router.patch("/:id", verifyToken, bookingController.updateBooking);

export default router;
