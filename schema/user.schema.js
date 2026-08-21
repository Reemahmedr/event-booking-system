import * as z from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),

  password: z
    .string()
    .trim()
    .min(6, { message: "Password must be at least 6 characters" })
    .regex(/[A-Z]/, {
      message: "Password must contain an uppercase letter",
    })
    .regex(/[a-z]/, {
      message: "Password must contain a lowercase letter",
    })
    .regex(/[0-9]/, {
      message: "Password must contain a number",
    }),
});
export default { updateProfileSchema, changePasswordSchema };
