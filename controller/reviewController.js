import Review from "../models/reviewModel.js";
import httpStatusText from "../utils/httpStatusText.js";
import asyncWrapper from "../middleware/asyncWrapper.js";
import { Booking } from "../models/bookingModel.js";

async function addReview(req, res, next) {
  const userId = req.user._id;
  const eventId = req.params.id;
  const { rating, comment } = req.body;
  if (!eventId) {
    return res
      .status(404)
      .json({ status: httpStatusText.FAIL, message: "Event id not found" });
  }
  const userBookingExists = await Booking.findOne({
    user: userId,
    event: eventId,
  });

  if (!userBookingExists) {
    return res.status(400).json({
      status: httpStatusText.ERROR,
      message: "To rate an event you must book it",
    });
  }

  const review = await Review.findOne({ user: userId, event: eventId });
  if (review) {
    return res.status(409).json({
      status: httpStatusText.FAIL,
      message: "You have already reviewed this event",
    });
  }
  const createReview = await Review.create({
    user: userId,
    event: eventId,
    rating,
    comment,
  });

  return res.status(201).json({
    status: httpStatusText.SUCCESS,
    message: "Reveiw added successfully",
    data: {
      createReview,
    },
  });
}

async function getMyReviews(req, res, next) {
  const userId = req.user._id;
  const userReviews = await Review.find({ user: userId }).populate("event");
  if (userReviews.length === 0) {
    return res.status(200).json({
      status: httpStatusText.SUCCESS,
      message: "No reviews yet",
      data: {
        userReviews,
      },
    });
  }
  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      userReviews,
    },
  });
}

async function updateReview(req, res, next) {
  const userId = req.user._id;
  const reviewId = req.params.id;
  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({
      status: httpStatusText.FAIL,
      message: "At least one field is required",
    });
  }
  if (!reviewId) {
    return res.status(400).json({
      status: httpStatusText.FAIL,
      message: "Review id is required",
    });
  }
  const userReview = await Review.findOneAndUpdate(
    {
      _id: reviewId,
      user: userId,
    },
    { $set: req.body },
    { new: true },
  );
  if (!userReview) {
    return res
      .status(404)
      .json({ status: httpStatusText.ERROR, message: "Review is not found" });
  }
  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Review is updated successfully",
    data: { newReview: userReview },
  });
}

async function deleteReview(req, res, next) {
  const userId = req.user._id;
  const reviewId = req.params.id;
  if (!reviewId) {
    return res.status(400).json({
      status: httpStatusText.FAIL,
      message: "Review id is required",
    });
  }
  const userReview = await Review.findOneAndDelete({
    _id: reviewId,
    user: userId,
  });

  if (!userReview) {
    return res
      .status(404)
      .json({ status: httpStatusText.ERROR, message: "Review is not found" });
  }

  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Review deleted successfully",
  });
}

export default {
  addReview: asyncWrapper(addReview),
  getMyReviews: asyncWrapper(getMyReviews),
  updateReview: asyncWrapper(updateReview),
  deleteReview: asyncWrapper(deleteReview),
};
