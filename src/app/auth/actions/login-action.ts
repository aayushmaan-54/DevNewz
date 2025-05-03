"use server";
import { db } from "@/common/lib/db";
import { parseWithZod } from "@conform-to/zod";
import { loginSchema } from "@/common/validations/auth.schema";
import {
  comparePassword,
  generateAccessToken,
  setAuthCookie
} from "@/common/utils/auth";
import { SubmissionResult } from "@conform-to/react";
import { redirect } from "next/navigation";


export async function loginAction(
  _prevState: SubmissionResult | null,
  formData: FormData
) {
  const submission = parseWithZod(formData, {
    schema: loginSchema,
  });

  if (submission.status !== 'success') {
    return submission.reply();
  }

  const { username, password } = submission.value;

  try {
    const dbUser = await db.user.findFirst({
      where: { username: { equals: username, mode: "insensitive" } },
    });

    if (!dbUser) {
      return submission.reply({
        formErrors: ["Invalid credentials"],
      });
    }

    const isPasswordCorrect = await comparePassword(
      password,
      dbUser.hashedPassword
    );

    if (!isPasswordCorrect) {
      return submission.reply({
        formErrors: ["Invalid credentials"],
      });
    }

    const { token, expiryTime } = await generateAccessToken(dbUser.id, dbUser.username);
    await setAuthCookie(token, expiryTime, username);

    

    redirect("/news"); 
  } catch (error) {
    console.error("Login error:", error);
    
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    return submission.reply({
      formErrors: ["An unexpected error occurred. Please try again."]
    });
  }
}