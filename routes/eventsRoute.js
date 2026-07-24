import express from "express";
import eventsController from "../controller/eventsController.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/", eventsController.getAllEvents);
router.post("/", verifyToken, eventsController.createEvent);
router.get("/:id", verifyToken, eventsController.getSingleEvent);
router.patch("/:id", verifyToken, eventsController.updateEvent);
router.delete("/:id", verifyToken, eventsController.deleteEvent);

export default router;
