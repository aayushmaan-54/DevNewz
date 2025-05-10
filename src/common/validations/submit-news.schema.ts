import { z } from "zod";



export const submitNewsSchema = z
  .object({
    title: z
      .string()
      .min(10, { message: "Title too short (10+ chars)" })
      .max(50, { message: "Title too long (max 50 chars)" }),

    url: z
      .string()
      .url({ message: "Invalid URL format" })
      .max(2048, { message: "URL too long" })
      .optional()
      .or(z.literal("")),

    text: z
      .string()
      .min(30, { message: "News too short (30+ chars)" })
      .max(150, { message: "News too long (max 150 chars)" })
      .optional()
      .or(z.literal("")),
  })
  .refine(data => !(data.url && data.text), {
    message: "Cannot submit both URL and text. Choose one.",
    path: ["text"],
  })
  .refine(data => data.url || data.text, {
    message: "Either URL or text must be provided.",
    path: ["url"],
  });