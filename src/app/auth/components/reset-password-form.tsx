"use client";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { useActionState } from "react";
import { resetPasswordAction } from "../actions/reset-password-action";
import { resetPasswordSchema } from "@/common/validations/auth.schema";
import Form from "next/form";


export function ResetPasswordForm({
  token,
  userId,
}: {
  token: string;
  userId: string;
}) {
  const [lastResult, action, isPending] = useActionState(resetPasswordAction, null);

  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: resetPasswordSchema,
      });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  return (
    <Form
      id={form.id}
      onSubmit={form.onSubmit}
      action={action}
      className="py-3 space-y-2 belowHeaderContainer"
    >
      <h1 className='text-xl font-bold'>Reset Password</h1>
      <input type="hidden" name="token" value={token} disabled={isPending} />
      <input type="hidden" name="userId" value={userId} disabled={isPending} />

      {(lastResult && lastResult.status !== "success" && form.errors) && (
        <p className="error-text">{form.errors}</p>
      )}

      <div>
        <label htmlFor="password" className="inline-block w-34">New Password: </label>
        <input
          type="password"
          id="password"
          required
          className="input"
          name={fields.password.name}
          key={fields.password.key}
          disabled={isPending}
          defaultValue={fields.password.initialValue}
        />
        {fields.password.errors && (
          <p className="error-text">{fields.password.errors}</p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="inline-block w-34">Confirm Password: </label>
        <input
          type="password"
          id="confirmPassword"
          required
          className="input"
          name={fields.confirmPassword.name}
          key={fields.confirmPassword.key}
          disabled={isPending}
          defaultValue={fields.confirmPassword.initialValue}
        />
        {fields.confirmPassword.errors && (
          <p className="error-text">{fields.confirmPassword.errors}</p>
        )}
      </div>

      <button type="submit" disabled={isPending} className="button">
        {isPending ? "Processing..." : "Reset Password"}
      </button>
    </Form>
  );
}