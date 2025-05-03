"use server";
import { db } from "@/common/lib/db";
import { parseWithZod } from "@conform-to/zod";
import { resetPasswordSchema } from "@/common/validations/auth.schema";
import type { SubmissionResult } from "@conform-to/react";
import { comparePassword, hashPassword, hashResetPasswordToken } from "@/common/utils/auth";
import { redirect } from "next/navigation";

type ResetPasswordActionResult = SubmissionResult<string[]> | null | undefined;


export async function resetPasswordAction(
  _prevState: ResetPasswordActionResult,
  formData: FormData
): Promise<ResetPasswordActionResult> {
  const validationResult = parseWithZod(formData, {
    schema: resetPasswordSchema,
  });

  if (validationResult.status !== "success") {
    return validationResult.reply();
  }

  const { password, confirmPassword } = validationResult.value;

  if (password !== confirmPassword) {
    return validationResult.reply({
      formErrors: ["Passwords do not match"],
    });
  }

  const incomingToken = formData.get("token") as string;
  const userId = formData.get("userId") as string;

  const hashedIncomingToken = await hashResetPasswordToken(incomingToken);

  try {
    const existingToken = await db.passwordResetToken.findUnique({
      where: { token: hashedIncomingToken },
    });

    if (!existingToken) {
      return validationResult.reply({
        formErrors: ["Invalid or expired reset link"],
      });
    }

    const now = new Date();
    const bufferSeconds = 5 * 1000; // 5-second buffer if server is little out of sync
    if (existingToken.expiresAt.getTime() < now.getTime() - bufferSeconds) {
      await db.passwordResetToken.delete({ where: { id: existingToken.id } });
      return validationResult.reply({ formErrors: ["Reset link has expired"] });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { hashedPassword: true },
    });

    if (!user) {
      return validationResult.reply({
        formErrors: ["User not found"],
      });
    }

    const isSamePassword = await comparePassword(password, user.hashedPassword);
    if (isSamePassword) {
      await db.passwordResetToken.delete({ where: { id: existingToken.id } });
      return validationResult.reply({ formErrors: ["New password must be different"] });
    }

    await db.$transaction([
      db.user.update({
        where: { id: userId },
        data: { hashedPassword: await hashPassword(password) },
      }),
      db.passwordResetToken.delete({ where: { id: existingToken.id } }),
    ]);

    redirect("/auth");
  } catch (error) {
    console.error("Password reset error:", error);
    
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    return validationResult.reply({
      formErrors: ["An error occurred. Please try again."],
    });
  }
}