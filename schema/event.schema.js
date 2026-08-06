import * as z from "zod";

const createEventSchema = z.object({
  title: z.string().trim().min(2, { message: "Title is required" }),
  description: z.string().trim().min(2, { message: "Description is required" }),
  location: z.string().trim().min(2, { message: "Location is required" }),
  date: z.coerce.date({ message: "Invalid date format" }),
  price: z.number().min(0, { message: "Price must be a positive number" }),
  availableSeats: z
    .number()
    .min(0, { message: "Available seats must be a positive number" }),
});

const updateEventSchema = createEventSchema.partial();

export default {
  createEventSchema,
  updateEventSchema,
};
