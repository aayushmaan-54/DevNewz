import { db } from "@/common/lib/db";
import { sendEmail } from "@/common/lib/send-mail";
import { generateResetPasswordToken, hashResetPasswordToken } from "@/common/utils/auth";
import { getTenMinutes } from "@/common/utils/time";
import { forgotPasswordSchema } from "@/common/validations/auth.schema";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
  try {
    console.log("WORKING");

    const body = await req.json();
    const result = forgotPasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { username } = result.data;

    console.log("WORKING");

    const userData = await db.user.findFirst({
      where: { username: { equals: username, mode: "insensitive" } },
      select: { id: true, email: true, username: true },
    });

    if (!userData) {
      return NextResponse.json(
        { success: false, message: "If this account exists, a reset email has been sent" },
        { status: 200 }
      );
    }
console.log("WORKING");
    if (!userData.email) {
      return NextResponse.json(
        { success: false, message: "No email associated with this account" },
        { status: 400 }
      );
    }

    await db.passwordResetToken.deleteMany({
      where: { userId: userData.id },
    });
    console.log("WORKING");
    const token = await generateResetPasswordToken();
    const expiresAt = getTenMinutes();
    const hashedToken = await hashResetPasswordToken(token);

    await db.passwordResetToken.create({
      data: {
        token: hashedToken,
        userId: userData.id,
        expiresAt,
      },
    });
    console.log("WORKING");
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password/${token}?userId=${userData.id}`;

    const res = await sendEmail({
      to: userData.email,
      username: userData.username || username,
      reset_link: resetLink,
    });
    console.log("WORKING");
    console.log("EMAIL RES", res);
    

    return NextResponse.json(
      { success: true, message: "If this account exists, a reset email has been sent" },
      { status: 200 }
    );

  } catch (err) {
    console.error("Password reset error:", err);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}