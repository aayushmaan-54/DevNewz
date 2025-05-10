/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { parseWithZod } from "@conform-to/zod";
import { SubmissionResult } from "@conform-to/react";
import { submitNewsSchema } from "@/common/validations/submit-news.schema";
import { decodedAuthToken } from "@/common/utils/auth";
import { db } from "@/common/lib/db";
import { redirect } from "next/navigation";


export async function submitNewsAction(
  _prevState: SubmissionResult | null | undefined,
  formData: FormData
) {
  const submission = parseWithZod(formData, {
    schema: submitNewsSchema,
  });

  if (submission.status !== 'success') {
    return submission.reply();
  }

  const { title, url, text } = submission.value;

  try {
    const { userId } = await decodedAuthToken() as any;

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true }
    });

    if (!user) {
      return submission.reply({
        formErrors: ["User not found"]
      });
    }

    let type: 'GENERAL' | 'ASK' | 'SHOW' = 'GENERAL';
    if (title.trim().startsWith('Ask DevNewz:')) {
      type = 'ASK';
    } else if (title.trim().startsWith('Show DevNewz:')) {
      type = 'SHOW';
    }

    await db.news.create({
      data: {
        title: title,
        url: url || null,
        content: text || null,
        userId: user.id,
        type: type,
      }
    });

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