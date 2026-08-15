import bookingController from "../controller/bookingController.js";
import { describe, test, expect, jest } from "@jest/globals";
import { Event } from "../models/eventModel.js";
import { Booking } from "../models/bookingModel.js";

describe("Book Event", () => {
  test("should return error if event does not exist", async () => {
    const findEventMock = jest.spyOn(Event, "findById");
    findEventMock.mockResolvedValue(null);
    const req = {
      params: { id: "nonexistentEventId" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();
    await bookingController.bookEvent(req, res, next);
    expect(findEventMock).toHaveBeenCalledWith("nonexistentEventId");
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "Event not found",
    });
  });

  test("should return error if event is fully booked", async () => {
    const findEventMock = jest.spyOn(Event, "findById");

    findEventMock.mockResolvedValue({
      _id: "eventId",
      capacity: 10,
    });

    const bookingsMock = jest.spyOn(Booking, "find");

    bookingsMock.mockResolvedValue([
      { numberOfSeats: 5 },
      { numberOfSeats: 6 },
    ]);

    const req = {
      params: {
        id: "eventId",
      },
      body: {
        numberOfSeats: 1,
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const next = jest.fn();

    await bookingController.bookEvent(req, res, next);

    expect(findEventMock).toHaveBeenCalledWith("eventId");

    expect(bookingsMock).toHaveBeenCalledWith({
      event: "eventId",
    });

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      status: "fail",
      message: "Sorry, Event is fully booked",
    });
  });

  test("should return error if user already booked the event", async () => {
    const findEventMock = jest.spyOn(Event, "findById");

    findEventMock.mockResolvedValue({
      _id: "eventId",
      capacity: 10,
    });

    const bookingsMock = jest.spyOn(Booking, "find");

    bookingsMock.mockResolvedValue([]);

    const alreadyBookedMock = jest.spyOn(Booking, "findOne");

    alreadyBookedMock.mockResolvedValue({
      user: "userId",
      event: "eventId",
    });

    const req = {
      params: {
        id: "eventId",
      },
      body: {
        user: "userId",
        numberOfSeats: 2,
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const next = jest.fn();

    await bookingController.bookEvent(req, res, next);

    expect(findEventMock).toHaveBeenCalledWith("eventId");

    expect(bookingsMock).toHaveBeenCalledWith({
      event: "eventId",
    });

    expect(alreadyBookedMock).toHaveBeenCalledWith({
      user: "userId",
      event: "eventId",
    });

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      status: "fail",
      message: "You already booked this event",
    });
  });

  test("should create a new booking if all conditions are met", async () => {
    const findEventMock = jest.spyOn(Event, "findById");
    findEventMock.mockResolvedValue({
      _id: "eventId",
      capacity: 10,
    });
    const bookingsMock = jest.spyOn(Booking, "find");
    bookingsMock.mockResolvedValue([{ numberOfSeats: 2 }]);
    const alreadyBookedMock = jest.spyOn(Booking, "findOne");
    alreadyBookedMock.mockResolvedValue(null);
    const createBookingMock = jest.spyOn(Booking, "create");
    createBookingMock.mockResolvedValue({
      _id: "bookingId",
      user: "userId",
      event: "eventId",
      numberOfSeats: 3,
    });
    const updateEventMock = jest.spyOn(Event, "findByIdAndUpdate");
    updateEventMock.mockResolvedValue({
      _id: "eventId",
      capacity: 10,
    });
    const req = {
      params: {
        id: "eventId",
      },
      body: {
        user: "userId",
        numberOfSeats: 3,
      },
      user: {
        _id: "userId",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();
    await bookingController.bookEvent(req, res, next);

    expect(findEventMock).toHaveBeenCalledWith("eventId");
    expect(bookingsMock).toHaveBeenCalledWith({
      event: "eventId",
    });
    expect(alreadyBookedMock).toHaveBeenCalledWith({
      user: "userId",
      event: "eventId",
    });
    expect(createBookingMock).toHaveBeenCalledWith({
      user: "userId",
      event: "eventId",
      numberOfSeats: 3,
    });
    expect(updateEventMock).toHaveBeenCalledWith(
      "eventId",
      {
        $inc: { availableSeats: -3 },
      },
      { new: true },
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      data: {
        booking: {
          _id: "bookingId",
          user: "userId",
          event: "eventId",
          numberOfSeats: 3,
        },
      },
    });
  });
});

describe("Get My Booking", () => {
  test("should return error if no bookings found for the user", async () => {
    const populateMock = jest.fn().mockResolvedValue([]);
    const findBookingsMock = jest.spyOn(Booking, "find");
    findBookingsMock.mockReturnValue({
      populate: populateMock,
    });
    const req = {
      user: {
        _id: "userId",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();
    await bookingController.getMyBooking(req, res, next);
    expect(findBookingsMock).toHaveBeenCalledWith({
      user: "userId",
    });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: "fail",
      message: "no booking found",
    });
  });

  test("should return bookings for the user if found", async () => {
    const bookings = [
      {
        _id: "bookingId",
        user: "userId",
        event: {
          _id: "eventId",
          title: "Football Match",
        },
        numberOfSeats: 2,
      },
    ];
    const populateMock = jest.fn().mockResolvedValue(bookings);
    const findBookingsMock = jest.spyOn(Booking, "find");
    findBookingsMock.mockReturnValue({
      populate: populateMock,
    });
    const req = {
      user: {
        _id: "userId",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();
    await bookingController.getMyBooking(req, res, next);
    expect(findBookingsMock).toHaveBeenCalledWith({
      user: "userId",
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      data: {
        myBooking: bookings,
      },
    });
  });
});

describe("Cancel Booking", () => {
  test("should return error if booking not found or not owned by user", async () => {
    const populateMock = jest.fn().mockResolvedValue(null);
    const findByIdAndDeleteMock = jest.spyOn(Booking, "findByIdAndDelete");
    findByIdAndDeleteMock.mockReturnValue({
      populate: populateMock,
    });
    const req = {
      user: {
        _id: "userId",
      },
      params: {
        id: "bookingId",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();
    await bookingController.cancelBooking(req, res, next);
    expect(findByIdAndDeleteMock).toHaveBeenCalledWith({
      user: "userId",
      _id: "bookingId",
    });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "fail",
      message: "Booking not found or not yours",
    });
  });

  test("should cancel booking if found and owned by user", async () => {
    const booking = {
      id: "bookingId",
      user: "userId",
    };
    const populateMock = jest.fn().mockResolvedValue(booking);
    const findByIdAndDeleteMock = jest.spyOn(Booking, "findByIdAndDelete");
    findByIdAndDeleteMock.mockReturnValue({
      populate: populateMock,
    });
    const req = {
      user: {
        _id: "userId",
      },
      params: {
        id: "bookingId",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();
    await bookingController.cancelBooking(req, res, next);
    expect(findByIdAndDeleteMock).toHaveBeenCalledWith({
      user: "userId",
      _id: "bookingId",
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      data: {
        message: "Booking deleted successfully",
        cancelBooking: booking,
      },
    });
  });
});

describe("Update Booking", () => {
  test("should return error if booking not found or not owned by user", async () => {
    const findOneMock = jest.spyOn(Booking, "findOne");
    findOneMock.mockResolvedValue(null);
    const req = {
      user: {
        _id: "userId",
      },
      params: {
        id: "bookingId",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();
    await bookingController.updateBooking(req, res, next);
    expect(findOneMock).toHaveBeenCalledWith({
      _id: "bookingId",
      user: "userId",
    });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "Booking not found",
    });
  });

  test("should return error if event is not found when updating booking", async () => {
    const booking = {
      _id: "bookingId",
      user: "userId",
      event: "eventId",
      numberOfSeats: 2,
    };
    const findOneMock = jest.spyOn(Booking, "findOne");
    findOneMock.mockResolvedValue(booking);
    const findEventMock = jest.spyOn(Event, "findById");
    findEventMock.mockResolvedValue(null);
    const req = {
      params: {
        id: "bookingId",
      },
      user: {
        _id: "userId",
      },
      body: {
        event: "eventId",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();
    await bookingController.updateBooking(req, res, next);
    expect(findOneMock).toHaveBeenCalledWith({
      _id: "bookingId",
      user: "userId",
    });
    expect(findEventMock).toHaveBeenCalledWith("eventId");
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: "fail",
      message: "Event not found",
    });
  });

  test("should return error if there are not enough seats when increasing booking", async () => {
    const booking = {
      _id: "bookingId",
      user: "userId",
      event: "eventId",
      numberOfSeats: 2,
    };

    const findOneMock = jest.spyOn(Booking, "findOne");

    findOneMock.mockResolvedValue(booking);

    const findEventMock = jest.spyOn(Event, "findById");

    findEventMock.mockResolvedValue({
      _id: "eventId",
      availableSeats: 2,
    });

    const req = {
      params: {
        id: "bookingId",
      },
      user: {
        _id: "userId",
      },
      body: {
        event: "eventId",
        numberOfSeats: 5,
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const next = jest.fn();

    await bookingController.updateBooking(req, res, next);

    expect(findOneMock).toHaveBeenCalledWith({
      _id: "bookingId",
      user: "userId",
    });

    expect(findEventMock).toHaveBeenCalledWith("eventId");

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      status: "fail",
      message: "No available seats",
    });
  });
  test("should return error if new event does not have enough seats", async () => {
    const booking = {
      _id: "bookingId",
      user: "userId",
      event: "oldEventId",
      numberOfSeats: 2,
    };

    const findOneMock = jest.spyOn(Booking, "findOne");
    findOneMock.mockResolvedValue(booking);

    const findEventMock = jest.spyOn(Event, "findById");

    findEventMock
      .mockResolvedValueOnce({
        _id: "newEventId",
        availableSeats: 2,
      })
      .mockResolvedValueOnce({
        _id: "oldEventId",
        availableSeats: 5,
      });

    const req = {
      params: {
        id: "bookingId",
      },
      user: {
        _id: "userId",
      },
      body: {
        event: "newEventId",
        numberOfSeats: 5,
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const next = jest.fn();

    await bookingController.updateBooking(req, res, next);

    expect(findOneMock).toHaveBeenCalledWith({
      _id: "bookingId",
      user: "userId",
    });

    expect(findEventMock).toHaveBeenNthCalledWith(1, "newEventId");

    expect(findEventMock).toHaveBeenNthCalledWith(2, "oldEventId");

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      status: "fail",
      message: "No available seats",
    });
  });

  test("should update booking successfully", async () => {
    const booking = {
      _id: "bookingId",
      user: "userId",
      event: "oldEventId",
      numberOfSeats: 2,
      save: jest.fn(),
    };

    const findOneMock = jest.spyOn(Booking, "findOne");
    findOneMock.mockResolvedValue(booking);

    const findEventMock = jest.spyOn(Event, "findById");

    findEventMock
      .mockResolvedValueOnce({
        _id: "newEventId",
        availableSeats: 10,
      })
      .mockResolvedValueOnce({
        _id: "oldEventId",
        availableSeats: 5,
      });

    const updateEventMock = jest.spyOn(Event, "findByIdAndUpdate");

    updateEventMock.mockResolvedValue({});

    const req = {
      params: {
        id: "bookingId",
      },
      user: {
        _id: "userId",
      },
      body: {
        event: "newEventId",
        numberOfSeats: 4,
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const next = jest.fn();

    await bookingController.updateBooking(req, res, next);

    expect(findOneMock).toHaveBeenCalledWith({
      _id: "bookingId",
      user: "userId",
    });

    expect(findEventMock).toHaveBeenNthCalledWith(1, "newEventId");

    expect(findEventMock).toHaveBeenNthCalledWith(2, "oldEventId");

    expect(updateEventMock).toHaveBeenNthCalledWith(1, "oldEventId", {
      $inc: {
        availableSeats: 2,
      },
    });

    expect(updateEventMock).toHaveBeenNthCalledWith(2, "newEventId", {
      $inc: {
        availableSeats: -4,
      },
    });

    expect(booking.save).toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      data: {
        booking,
      },
    });
  });
});
