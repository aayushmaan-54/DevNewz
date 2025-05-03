import { z } from "zod";



export const loginSchema = z.object({
  username: z
    .string()
    .min(1, { message: "Username must be at least 1 character long." })
    .max(15, { message: "Username must be at most 15 characters long." }),

  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long." })
    .max(128, { message: "Password must be at most 128 characters long." }),
});



export const signupSchema = z.object({
  username: z
    .string()
    .min(1, { message: "Username must be at least 1 character long." })
    .max(15, { message: "Username must be at most 15 characters long." }),

  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long." })
    .max(128, { message: "Password must be at most 128 characters long." }),
});



export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long." })
      .max(128, { message: "Password must be at most 128 characters long." }),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });



export const emailSchema = z.object({
  email: z
    .string()
    .email({ message: "Invalid email address." }),
});


export const updateProfileSchema = z.object({
  email: z
    .string()
    .email({ message: "Invalid email address." })
    .optional(),

  about: z
    .string()
    .min(10, "About section must be at least 10 characters long.")
    .max(300, "About section must be at most 300 characters long.")
    .optional(),

  noProcrast: z.enum(["no", "yes"]).optional(),

  maxVisit: z
    .number({ invalid_type_error: "Must be a number" })
    .int()
    .min(5, "Minimum browsing time should be at least 5 minutes")
    .max(1440, "Cannot browse more than 24 hours per day")
    .optional(),

  minAway: z
    .number({ invalid_type_error: "Must be a number" })
    .int()
    .min(5, "Must stay away at least 5 minutes")
    .max(1440, "Cannot require more than 24 hours of away time")
    .optional(),

  delay: z
    .number({ invalid_type_error: "Must be a number" })
    .int()
    .min(0, "Delay must be 0 or more")
    .max(1440, "Cannot delay more than 24 hours")
    .optional(),
});


export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, { message: "Current password is required." }),

    newPassword: z
      .string()
      .min(8, { message: "New password must be at least 8 characters long." })
      .max(128, { message: "New password must be at most 128 characters long." }),
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password.",
    path: ["newPassword"],
  });


export const forgotPasswordSchema = z.object({
  username: z
    .string()
    .min(1, { message: "Username must be at least 1 character long." })
    .max(15, { message: "Username must be at most 15 characters long." }),
});