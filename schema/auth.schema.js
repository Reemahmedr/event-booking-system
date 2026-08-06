import * as z from "zod";
import userRoles from "../utils/userRoles.js";

const registerSchema = z.object({
  name: z.string().min(2, { message: "Name is required" }).trim(),
  email: z
    .string()
    .email({ message: "Invalid email address" })
    .trim()
    .lowercase(),
  password: z
    .string()
    .trim()
    .min(6, { message: "Password must be at least 6 characters" })
    .regex(/[A-Z]/, { message: "Password must contain an uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain a lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain a number" }),

  role: z.enum([userRoles.ADMIN, userRoles.USER]).optional(),
});

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Invalid email address" })
    .lowercase(),
  password: z
    .string()
    .trim()
    .min(6, { message: "Password must be at least 6 characters long" }),
});

export default {
  registerSchema,
  loginSchema,
};
