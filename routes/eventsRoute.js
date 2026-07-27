import express from "express";
import eventsController from "../controller/eventsController.js";
import verifyToken from "../middleware/verifyToken.js";
import allowedTo from "../middleware/allowedTo.js";
import userRoles from "../utils/userRoles.js";

const router = express.Router();

router.get("/", eventsController.getAllEvents);
router.post(
  "/",
  verifyToken,
  allowedTo(userRoles.ADMIN),
  eventsController.createEvent,
);
router.get("/:id", verifyToken, eventsController.getSingleEvent);
router.patch(
  "/:id",
  verifyToken,
  allowedTo(userRoles.ADMIN),
  eventsController.updateEvent,
);
router.delete(
  "/:id",
  verifyToken,
  allowedTo(userRoles.ADMIN),
  eventsController.deleteEvent,
);

export default router;
