import * as z from "zod";

const category = z.object({
  name: z.string().min(2, { message: "The name must be at least 2 letters" }),

  description: z
    .string()
    .min(10, { message: "Description must be at least 10 letters" }),
});

const updateCategory = z.object({
  name: z
    .string()
    .min(2, { message: "The name must be at least 2 letters" })
    .optional(),

  description: z
    .string()
    .min(10, { message: "Description must be at least 10 letters" })
    .optional(),
});

export default {
  category,
  updateCategory,
};
