import asyncWrapper from "../middleware/asyncWrapper.js";
import { Event } from "../models/eventModel.js";
import httpStatusText from "../utils/httpStatusText.js";
import { validationResult } from "express-validator";

async function getAllEvents(req, res, next) {
  const limit = req.query.limit || 10;
  const page = req.query.page || 1;
  const skip = (page - 1) * limit;
  const events = await Event.find().limit(limit).skip(skip);
  res.status(200).json({ status: httpStatusText.SUCCESS, data: { events } });
}

async function createEvent(req, res, next) {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res
      .status(400)
      .json({ status: httpStatusText.ERROR, message: error });
  }
  const event = await Event.create({ ...req.body });
  res.status(201).json({ status: httpStatusText.SUCCESS, data: { event } });
}

async function getSingleEvent(req, res, next) {
  const event = await Event.findById(req.params.id);
  if (!event) {
    return res
      .status(400)
      .json({ status: httpStatusText.FAIL, message: "event is not found" });
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
  const newEvent = await Event.findByIdAndUpdate(
    req.params.id,
    {
      $set: { ...req.body },
    },
    { new: true },
  );

  if (!newEvent) {
    return res.status(404).json({
      status: httpStatusText.ERROR,
      message: "Event is not found",
    });
  }
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { message: "your event updated successfully", newEvent },
  });
}

async function deleteEvent(req, res, next) {
  const event = await Event.findByIdAndDelete(req.params.id);
  if (!event) {
    return res
      .status(404)
      .json({ status: httpStatusText.FAIL, message: "Event not found" });
  }
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
