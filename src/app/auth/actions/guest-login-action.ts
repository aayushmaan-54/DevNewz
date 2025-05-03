"use server";
import { db } from "@/common/lib/db";
import {
  generateAccessToken,
  generateRandomCredentials,
  hashPassword,
  setAuthCookie
} from "@/common/utils/auth";
import { redirect } from "next/navigation";


type ActionResult = {
  success: boolean;
  message: string;
  data: null;
};


export async function guestLoginAction(): Promise<ActionResult> {
  try {
    const MAX_ATTEMPTS = 3;
    let attempts = 0;
    let newUser = null;

    while (attempts < MAX_ATTEMPTS && !newUser) {
      attempts++;
      const { username, password } = generateRandomCredentials();

      newUser = await db.$transaction(async (tx) => {
        const existingUser = await tx.user.findFirst({
          where: { username: { equals: username, mode: "insensitive" } },
          select: { id: true }
        });

        if (existingUser) return null;

        const hashedPassword = await hashPassword(password);
        return await tx.user.create({
          data: { username, hashedPassword, role: "GUEST" },
          select: { id: true, username: true }
        });
      });
    }

    if (!newUser) {
      return {
        success: false,
        message: "Failed to create guest account after multiple attempts. Please try again.",
        data: null,
      };
    }

    const { token, expiryTime } = await generateAccessToken(newUser.id, newUser.username);
    await setAuthCookie(token, expiryTime, newUser.username);

    redirect("/news"); 
  } catch (error) {
    console.error("Guest login error:", error);
    
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
      data: null
    };
  }
}