"use server";
import { db } from "@/common/lib/db";
import { parseWithZod } from "@conform-to/zod";
import { signupSchema } from "@/common/validations/auth.schema";
import {
  generateAccessToken,
  hashPassword,
  setAuthCookie
} from "@/common/utils/auth";
import { SubmissionResult } from "@conform-to/react";
import { redirect } from "next/navigation";


export async function signupAction(
  _prevState: SubmissionResult | null,
  formData: FormData
) {
  const submission = parseWithZod(formData, {
    schema: signupSchema,
  });

  if (submission.status !== 'success') {
    return submission.reply();
  }

  const { username, password } = submission.value;

  try {
    const result = await db.$transaction(async (tx) => {
      const existingUser = await tx.user.findFirst({
        where: { username: { equals: username, mode: "insensitive" } },
        select: { id: true, username: true }
      });

      if (existingUser) {
        return submission.reply({
           formErrors: ["Username already taken"]
        });
      }

      const hashedPassword = await hashPassword(password);
      const newUser = await tx.user.create({
        data: { username, hashedPassword },
        select: { id: true, username: true }
      });

      return newUser;
    });

    if (result && typeof result === 'object' && 'error' in result) {
      return result as SubmissionResult;
    }

    if (result && 'id' in result) {
      const { token, expiryTime } = await generateAccessToken(result.id, result.username);
      await setAuthCookie(token, expiryTime, username);
      return redirect("/news");
    }

    return submission.reply({
      formErrors: ["Failed to create user account"]
    });

  } catch (error) {
    console.error("Signup error:", error);

    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    return submission.reply({
      formErrors: ["An unexpected error occurred. Please try again."]
    });
  }
}