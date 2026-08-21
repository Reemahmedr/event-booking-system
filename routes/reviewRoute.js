import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import validate from "../middleware/validatation.js";
import reviewController from "../controller/reviewController.js";
import reviewSchema from "../schema/review.schema.js";

const router = express.Router();
router.post(
  "/:id",
  verifyToken,
  validate(reviewSchema.reviewSchema),
  reviewController.addReview,
);

router.get("/", verifyToken, reviewController.getMyReviews);

router.patch(
  "/:id",
  verifyToken,
  validate(reviewSchema.updateReviewSchema),
  reviewController.updateReview,
);

router.delete("/:id", verifyToken, reviewController.deleteReview);
export default router;
