import * as z from "zod";

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(1).max(1000).optional(),
});

const updateReviewSchema = z
  .object({
    rating: z.number().min(1).max(5),
    comment: z.string().min(1).max(1000),
  })
  .partial();

export default {
  reviewSchema,
  updateReviewSchema
};
