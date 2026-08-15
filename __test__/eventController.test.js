import { describe, expect, jest, test } from "@jest/globals";
import { Event } from "../models/eventModel.js";
import eventsController from "../controller/eventsController.js";

describe("Get All Events", () => {
  test("should return all events", async () => {
    const events = [
      {
        _id: "event1",
        title: "Event 1",
      },
      {
        _id: "event2",
        title: "Event 2",
      },
    ];

    const skipMock = jest.fn().mockResolvedValue(events);

    const limitMock = jest.fn().mockReturnValue({
      skip: skipMock,
    });

    const eventsMock = jest.spyOn(Event, "find");

    eventsMock.mockReturnValue({
      limit: limitMock,
    });

    const req = {
      query: {
        limit: 10,
        page: 1,
      },
    };
    const skip = (req.query.page - 1) * req.query.limit;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();
    await eventsController.getAllEvents(req, res, next);
    expect(eventsMock).toHaveBeenCalledWith();
    expect(limitMock).toHaveBeenCalledWith(10);
    expect(skipMock).toHaveBeenCalledWith(0);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      data: {
        events,
      },
    });
  });
});

describe("Create Event", () => {
  test("should create event successfully", async () => {
    const createEventMock = jest.spyOn(Event, "create");

    const event = {
      _id: "eventId",
      title: "Football Match",
      description: "Football event",
      location: "Cairo",
      price: 100,
      availableSeats: 50,
    };

    createEventMock.mockResolvedValue(event);

    const req = {
      body: {
        title: "Football Match",
        description: "Football event",
        location: "Cairo",
        price: 100,
        availableSeats: 50,
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const next = jest.fn();

    await eventsController.createEvent(req, res, next);

    expect(createEventMock).toHaveBeenCalledWith(req.body);

    expect(res.status).toHaveBeenCalledWith(201);

    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      data: {
        event,
      },
    });
  });
});

describe("Get Single Event", () => {
  test("should return error when th event is not found", async () => {
    const findEventMock = jest.spyOn(Event, "findById");
    findEventMock.mockResolvedValue(null);
    const req = {
      params: {
        id: "eventId",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();
    await eventsController.getSingleEvent(req, res, next);
    expect(findEventMock).toHaveBeenCalledWith("eventId");
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "fail",
      message: "event is not found",
    });
  });

  test("should return successfully single event", async () => {
    const event = {
      _id: "eventId",
      title: "Football Match",
      description: "Football event",
      location: "Cairo",
      price: 100,
      availableSeats: 50,
    };
    const findEventMock = jest.spyOn(Event, "findById");
    findEventMock.mockResolvedValue(event);
    const req = {
      params: {
        id: "eventId",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();
    await eventsController.getSingleEvent(req, res, next);
    expect(findEventMock).toHaveBeenCalledWith("eventId");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      data: {
        event,
      },
    });
  });
});

describe("Delete Event", () => {
  test("should return error if event is not found", async () => {
    const findEventMock = jest.spyOn(Event, "findByIdAndDelete");
    findEventMock.mockResolvedValue(null);
    const req = {
      params: {
        id: "eventId",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();
    await eventsController.deleteEvent(req, res, next);
    expect(findEventMock).toHaveBeenCalledWith("eventId");
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: "fail",
      message: "Event not found",
    });
  });

  test("should delete event successfully", async () => {
    const event = {
      _id: "eventId",
      title: "Football Match",
      description: "Football event",
      location: "Cairo",
      price: 100,
      availableSeats: 50,
    };
    const findEventMock = jest.spyOn(Event, "findByIdAndDelete");
    findEventMock.mockResolvedValue(event);
    const req = {
      params: {
        id: "eventId",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();
    await eventsController.deleteEvent(req, res, next);
    expect(findEventMock).toHaveBeenCalledWith("eventId");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      message: `Event of title ${event.title} is deleted successfully`,
    });
  });
});

describe("Update Event", () => {
  test("should return error if no new content to update", async () => {
    const req = {
      params: {
        id: "eventId",
      },
      body: {},
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const next = jest.fn();

    await eventsController.updateEvent(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      status: "fail",
      message: "sorry no new content to update",
    });
  });
  test("should return error if event is not found", async () => {
    const findEventMock = jest.spyOn(Event, "findByIdAndUpdate");

    findEventMock.mockResolvedValue(null);

    const req = {
      params: {
        id: "eventId",
      },
      body: {
        title: "New Event Title",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const next = jest.fn();

    await eventsController.updateEvent(req, res, next);

    expect(findEventMock).toHaveBeenCalledWith(
      "eventId",
      {
        $set: {
          title: "New Event Title",
        },
      },
      {
        new: true,
      },
    );

    expect(res.status).toHaveBeenCalledWith(404);

    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "Event is not found",
    });
  });
  test("should update event successfully", async () => {
    const updatedEvent = {
      _id: "eventId",
      title: "Updated Football Match",
      description: "Updated description",
      location: "Cairo",
      price: 150,
      availableSeats: 40,
    };

    const findEventMock = jest.spyOn(Event, "findByIdAndUpdate");

    findEventMock.mockResolvedValue(updatedEvent);

    const req = {
      params: {
        id: "eventId",
      },
      body: {
        title: "Updated Football Match",
        price: 150,
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const next = jest.fn();

    await eventsController.updateEvent(req, res, next);

    expect(findEventMock).toHaveBeenCalledWith(
      "eventId",
      {
        $set: {
          title: "Updated Football Match",
          price: 150,
        },
      },
      {
        new: true,
      },
    );

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      data: {
        message: "your event updated successfully",
        newEvent: updatedEvent,
      },
    });
  });
});
