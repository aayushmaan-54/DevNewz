/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { db } from "@/common/lib/db";
import { parseWithZod } from "@conform-to/zod";
import { updateProfileSchema } from "@/common/validations/auth.schema";
import { decodedAuthToken } from "@/common/utils/auth";
import { SubmissionResult } from "@conform-to/react";
import { revalidatePath } from "next/cache";

type UpdateProfileActionResult = SubmissionResult<string[]> | null | undefined;


export async function updateProfileAction(
  _prevState: UpdateProfileActionResult,
  formData: FormData
): Promise<UpdateProfileActionResult> {
  const validationResult = parseWithZod(formData, {
    schema: updateProfileSchema,
  });

  if (validationResult.status !== "success") {
    return validationResult.reply();
  }

  const { about, email, noProcrast, maxVisit, minAway, delay } = validationResult.value;

  try {
    const { userId } = await decodedAuthToken() as any;

    const existingUser = await db.user.findUnique({
      where: { id: userId },
      select: { about: true, email: true, noProcrast: true, maxVisit: true, minAway: true, delay: true }
    });

    const updateData: Record<string, any> = {};
    if (about !== undefined && about !== existingUser?.about) updateData.about = about;
    if (email !== undefined && email !== existingUser?.email) updateData.email = email;
    if (noProcrast !== undefined && noProcrast !== existingUser?.noProcrast) updateData.noProcrast = noProcrast;
    if (maxVisit !== undefined && maxVisit !== existingUser?.maxVisit) updateData.maxVisit = maxVisit;
    if (minAway !== undefined && minAway !== existingUser?.minAway) updateData.minAway = minAway;
    if (delay !== undefined && delay !== existingUser?.delay) updateData.delay = delay;

    if (Object.keys(updateData).length > 0) {
      const updatedUser = await db.user.update({
        where: { id: userId },
        data: updateData,
      });

      revalidatePath('/auth/profile');
      return {
        status: 'success',
        payload: updatedUser,
      } as any;
    }
    return validationResult.reply();
  } catch (error) {
    console.error("profile update error:", error);
    return validationResult.reply({
      formErrors: ["An error occurred during profile update"]
    });
  }
}