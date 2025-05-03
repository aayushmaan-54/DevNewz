/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { db } from "@/common/lib/db";
import { parseWithZod } from "@conform-to/zod";
import { changePasswordSchema } from "@/common/validations/auth.schema";
import type { SubmissionResult } from "@conform-to/react";
import { comparePassword, decodedAuthToken, hashPassword } from "@/common/utils/auth";
import { redirect } from "next/navigation";

type ChangePasswordActionResult = SubmissionResult<string[]> | null | undefined;


export async function changePasswordAction(
  _prevState: ChangePasswordActionResult,
  formData: FormData
): Promise<ChangePasswordActionResult> {
  const validationResult = parseWithZod(formData, {
    schema: changePasswordSchema,
  });

  if (validationResult.status !== "success") {
    return validationResult.reply();
  }

  const { currentPassword, newPassword } = validationResult.value;

  try {
    const { userId } = await decodedAuthToken() as any;

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { hashedPassword: true }
    });

    if (!user) {
      return validationResult.reply({
        formErrors: ["User not found"]
      });
    }

    let isPasswordCorrect;
    try {
      isPasswordCorrect = await comparePassword(currentPassword, user.hashedPassword);
    } catch (error) {
      console.error("Password comparison error:", error);
      return validationResult.reply({
        formErrors: ["Invalid password format. Please contact support."]
      });
    }

    if (!isPasswordCorrect) {
      return validationResult.reply({
        formErrors: ["Current password is incorrect"]
      });
    }

    const isSamePassword = await comparePassword(newPassword, user.hashedPassword);
    if (isSamePassword) {
      return validationResult.reply({
        formErrors: ["New password must be different from current password"]
      });
    }

    const newHashedPassword = await hashPassword(newPassword);

    await db.user.update({
      where: { id: userId },
      data: {
        hashedPassword: newHashedPassword,
      }
    });

    redirect("/news");
  } catch (error) {
    console.error("Password change error:", error);

    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    return validationResult.reply({
      formErrors: ["An error occurred while changing your password"]
    });
  }
}