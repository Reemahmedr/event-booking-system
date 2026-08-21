import express from "express";
import saveForLaterController from "../controller/saveForLaterController.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/:id", verifyToken, saveForLaterController.saveEvent);
router.delete("/:id", verifyToken, saveForLaterController.deleteSavedEvent);
router.get("/", verifyToken, saveForLaterController.showSavedEvents);
export default router;
