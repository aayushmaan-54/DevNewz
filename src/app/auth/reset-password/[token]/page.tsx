import { notFound } from "next/navigation";
import { ResetPasswordForm } from "../../components/reset-password-form";
import { hashResetPasswordToken } from "@/common/utils/auth";
import { db } from "@/common/lib/db";
import Header from "@/app/components/header";


export default async function ResetPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ userId: string }>;
}) {
  const { token } = await params;
  const { userId } = await searchParams;

  if (!token || !userId) {
    notFound();
  }


  const hashedToken = await hashResetPasswordToken(token);

  const existingToken = await db.passwordResetToken.findFirst({
    where: {
      token: hashedToken,
      userId,
      expiresAt: { gt: new Date() },
    },
  });

  if (!existingToken) {
    notFound();
  }


  return (
    <>
      <Header text="Reset Password" />
      <ResetPasswordForm
        token={token}
        userId={userId}
      />
    </>
  );
}