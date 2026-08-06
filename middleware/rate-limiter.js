import rateLimit from "express-rate-limit";
import httpStatusText from "../utils/httpStatusText.js";

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100,
  message: {
    status: httpStatusText.FAIL,
    message: "Too many requests, please try again after 15 minutes",
  },
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5,
  message: {
    status: httpStatusText.FAIL,
    message: "Too many login attempts, try again after 15 minutes",
  },
});

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 3,
  message: {
    status: httpStatusText.FAIL,
    message: "Too many accounts created from this IP",
  },
});

export const bookingLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 20,
  message: {
    status: httpStatusText.FAIL,
    message:
      "Too many booking requests from this IP, please try again after a minute",
  },
});
