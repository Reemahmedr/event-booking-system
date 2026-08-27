import { Event } from "../models/eventModel.js";
import httpStatusText from "../utils/httpStatusText.js";
import { Booking } from "../models/bookingModel.js";
import asyncWrapper from "../middleware/asyncWrapper.js";
import Notification from "../models/notificationModel.js";

async function bookEvent(req, res, next) {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return res.status(404).json({
      status: httpStatusText.ERROR,
      message: "Event not found",
    });
  }
  const requestedSeats = req.body.numberOfSeats;
  if (requestedSeats > event.availableSeats) {
    return res.status(400).json({
      status: httpStatusText.FAIL,
      message: "Sorry, Event is fully booked",
    });
  }

  const alreadyBooked = await Booking.findOne({
    user: req.user._id,
    event: event._id,
  });

  if (alreadyBooked) {
    return res.status(400).json({
      status: httpStatusText.FAIL,
      message: "You already booked this event",
    });
  }

  const newBooking = await Booking.create({
    user: req.user._id,
    event: event._id,
    numberOfSeats: requestedSeats,
  });
  await Event.findByIdAndUpdate(
    event._id,
    {
      $inc: { availableSeats: -requestedSeats },
    },
    { new: true },
  );

  await Notification.create({
    user: req.user._id,
    type: "booking",
    message: `Your booking for "${event.title}" has been confirmed successfully.`,
  });
  return res.status(201).json({
    status: httpStatusText.SUCCESS,
    data: {
      booking: newBooking,
    },
  });
}

async function getMyBooking(req, res, next) {
  const myBooking = await Booking.find({ user: req.user._id }).populate(
    "event",
  );
  if (myBooking.length === 0) {
    return res.status(200).json({
      status: httpStatusText.SUCCESS,
      message: "no booking found",
      data: [],
    });
  }

  res.status(200).json({ status: httpStatusText.SUCCESS, data: { myBooking } });
}

async function cancelBooking(req, res, next) {
  const cancelBooking = await Booking.findByIdAndDelete({
    user: req.user._id,
    _id: req.params.id,
  }).populate("event");
  if (!cancelBooking) {
    return res.status(400).json({
      status: httpStatusText.FAIL,
      message: "Booking not found or not yours",
    });
  }
  await Event.findByIdAndUpdate(
    cancelBooking.event._id,
    {
      $inc: {
        availableSeats: cancelBooking.numberOfSeats,
      },
    },
    { new: true },
  );

  await Notification.create({
    user: req.user._id,
    type: "booking_cancelled",
    message: `Your booking for "${cancelBooking.event.title}" has been cancelled successfully.`,
  });
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { message: "Booking deleted successfully", cancelBooking },
  });
}

async function updateBooking(req, res, next) {
  const booking = await Booking.findOne({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!booking) {
    return res
      .status(404)
      .json({ status: httpStatusText.ERROR, message: "Booking not found" });
  }
  const eventId = req.body.event || booking.event;
  const newSeats = req.body.numberOfSeats ?? booking.numberOfSeats;
  const newEvent = await Event.findById(eventId);

  if (!newEvent) {
    return res.status(404).json({
      status: httpStatusText.FAIL,
      message: "Event not found",
    });
  }

  if (booking.event.toString() === eventId.toString()) {
    const difference = newSeats - booking.numberOfSeats;

    if (difference > 0) {
      if (newEvent.availableSeats < difference) {
        return res.status(400).json({
          status: httpStatusText.FAIL,
          message: "No available seats",
        });
      }
    }

    await Event.findByIdAndUpdate(newEvent._id, {
      $inc: {
        availableSeats: -difference,
      },
    });
  } else {
    const oldEvent = await Event.findById(booking.event);

    if (newEvent.availableSeats < newSeats) {
      return res.status(400).json({
        status: httpStatusText.FAIL,
        message: "No available seats",
      });
    }

    await Event.findByIdAndUpdate(oldEvent._id, {
      $inc: {
        availableSeats: booking.numberOfSeats,
      },
    });

    await Event.findByIdAndUpdate(newEvent._id, {
      $inc: {
        availableSeats: -newSeats,
      },
    });
  }

  booking.event = eventId;
  booking.numberOfSeats = newSeats;

  await booking.save();
  await Notification.create({
    user: req.user._id,
    type: "booking_updated",
    message: `Your booking for "${newEvent.title}" has been updated successfully.`,
  });
  res.status(200).json({ status: httpStatusText.SUCCESS, data: { booking } });
}

export default {
  bookEvent: asyncWrapper(bookEvent),
  getMyBooking: asyncWrapper(getMyBooking),
  cancelBooking: asyncWrapper(cancelBooking),
  updateBooking: asyncWrapper(updateBooking),
};
