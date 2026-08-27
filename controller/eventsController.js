import asyncWrapper from "../middleware/asyncWrapper.js";
import category from "../models/categoryModel.js";
import { Event } from "../models/eventModel.js";
import httpStatusText from "../utils/httpStatusText.js";
import { Booking } from "../models/bookingModel.js";

async function getAllEvents(req, res, next) {
  const limit = req.query.limit || 10;
  const page = req.query.page || 1;
  const skip = (page - 1) * limit;
  const events = await Event.find()
    .limit(limit)
    .skip(skip)
    .populate("category");
  res.status(200).json({ status: httpStatusText.SUCCESS, data: { events } });
}

async function createEvent(req, res, next) {
  const categoryExists = await category.findById(req.body.category);
  if (!categoryExists) {
    return res.status(404).json({
      status: httpStatusText.FAIL,
      message: "Category is not found",
    });
  }
  const event = await Event.create({ ...req.body });
  await event.populate("category");
  res.status(201).json({ status: httpStatusText.SUCCESS, data: { event } });
}

async function getSingleEvent(req, res, next) {
  const event = await Event.findById(req.params.id).populate("category");
  if (!event) {
    return res
      .status(404)
      .json({ status: httpStatusText.FAIL, message: "Event is not found" });
  }
  res.status(200).json({ status: httpStatusText.SUCCESS, data: { event } });
}

async function updateEvent(req, res, next) {
  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({
      status: httpStatusText.FAIL,
      message: "sorry no new content to update",
    });
  }

  if (req.body.category) {
    const categoryExists = await category.findById(req.body.category);

    if (!categoryExists) {
      return res.status(404).json({
        status: httpStatusText.FAIL,
        message: "Category is not found",
      });
    }
  }
  const newEvent = await Event.findByIdAndUpdate(
    req.params.id,
    {
      $set: { ...req.body },
    },
    { new: true },
  ).populate("category");

  if (!newEvent) {
    return res.status(404).json({
      status: httpStatusText.ERROR,
      message: "Event is not found",
    });
  }
  const bookings = await Booking.find({
    event: req.params.id,
  });
  for (const booking of bookings) {
    await Notification.create({
      user: booking.user,
      type: "event_updated",
      message: `The event "${newEvent.title}" has been updated.`,
    });
  }
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { message: "your event updated successfully", newEvent },
  });
}

async function deleteEvent(req, res, next) {
  const event = await Event.findById(req.params.id);
  if (!event) {
    return res
      .status(404)
      .json({ status: httpStatusText.FAIL, message: "Event not found" });
  }
  const bookings = await Booking.find({
    event: event._id,
  });

  for (const booking of bookings) {
    await Notification.create({
      user: booking.user,
      type: "event_cancelled",
      message: `The event "${event.title}" has been cancelled.`,
    });
  }

  await Event.findByIdAndDelete(event._id);
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: `Event of title ${event.title} is deleted successfully`,
  });
}

export default {
  getAllEvents: asyncWrapper(getAllEvents),
  createEvent: asyncWrapper(createEvent),
  getSingleEvent: asyncWrapper(getSingleEvent),
  updateEvent: asyncWrapper(updateEvent),
  deleteEvent: asyncWrapper(deleteEvent),
};
