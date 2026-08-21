import { Event } from "../models/eventModel.js";
import saveForLater from "../models/saveForLaterModel.js";
import httpStatusText from "../utils/httpStatusText.js";
import asyncWrapper from "../middleware/asyncWrapper.js";

async function saveEvent(req, res, next) {
  const userId = req.user._id;
  const eventId = req.params.id;
  const eventExists = await Event.findById(eventId);
  if (!eventExists) {
    return res
      .status(404)
      .json({ status: httpStatusText.FAIL, message: "Event is not found" });
  }
  const saveExists = await saveForLater.findOne({
    user: userId,
    event: eventId,
  });
  if (saveExists) {
    return res.status(409).json({
      status: httpStatusText.ERROR,
      message: "This event is already saved",
    });
  }
  const createSaveForLater = await saveForLater.create({
    user: userId,
    event: eventId,
  });

  return res.status(201).json({
    status: httpStatusText.SUCCESS,
    message: "Your event is saved for later successfully",
    data: {
      createSaveForLater,
    },
  });
}

async function deleteSavedEvent(req, res, next) {
  const userId = req.user._id;
  const eventId = req.params.id;
  const savedEventExists = await saveForLater.findOneAndDelete({
    user: userId,
    event: eventId,
  });
  if (!savedEventExists) {
    return res.status(404).json({
      status: httpStatusText.FAIL,
      message: "Saved Event is not found",
    });
  }
  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Saved event is deleted successfully",
  });
}

async function showSavedEvents(req, res, next) {
  const limit = req.query.limit || 10;
  const page = req.query.page || 1;
  const skip = (page - 1) * limit;
  const userId = req.user._id;
  const allSavedEvents = await saveForLater
    .find({ user: userId })
    .limit(limit)
    .skip(skip)
    .populate("event");
  if (allSavedEvents.length === 0) {
    return res.status(200).json({
      status: httpStatusText.SUCCESS,
      message: "You haven't saved any events yet",
      data: { allSavedEvents },
    });
  }
  return res
    .status(200)
    .json({ status: httpStatusText.SUCCESS, data: { allSavedEvents } });
}

export default {
  saveEvent: asyncWrapper(saveEvent),
  deleteSavedEvent: asyncWrapper(deleteSavedEvent),
  showSavedEvents: asyncWrapper(showSavedEvents),
};
