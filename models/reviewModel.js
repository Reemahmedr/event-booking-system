import mongoose from "mongoose";

const reviewModel = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: {
      type: String,
      min: 1,
      max: 1000,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

reviewModel.index({ user: 1, event: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewModel);
export default Review;
