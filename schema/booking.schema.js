import * as z from "zod";

const createBookingSchema = z.object({
  numberOfSeats: z
    .number()
    .int({ message: "Number of seats must be an integer" })
    .min(1, { message: "You must book at least one seat" }),
});

const updateBookingSchema = z.object({
  numberOfSeats: z
    .number()
    .int({ message: "Number of seats must be an integer" })
    .min(1, { message: "You must book at least one seat" })
    .optional(),

  event: z.string({ message: "Event ID is required" }).optional(),
});

export default {
  createBookingSchema,
  updateBookingSchema,
};
