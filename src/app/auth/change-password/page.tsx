"use client";
import Form from "next/form";
import { changePasswordAction } from "../actions/change-password-action";
import { useActionState } from "react";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { changePasswordSchema } from "@/common/validations/auth.schema";
import Header from "@/app/components/header";


export default function ChangePasswordPage() {
  const [lastResult, action, isPending] = useActionState(changePasswordAction, null);

  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: changePasswordSchema,
      });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  return (
    <>
    <Header text="Change Password" />
      <Form
        action={action}
        id={form.id}
        onSubmit={form.onSubmit}
        className="flex flex-col space-y-2 py-3 belowHeaderContainer"
      >
        {(lastResult && lastResult.status !== "success" && form.errors) && (
          <p className="error-text">{form.errors}</p>
        )}
        <h1 className="text-xl font-bold">Change Password</h1>
        <label htmlFor="currentPassword">Current Password: {" "}
          <input
            type="password"
            name={fields.currentPassword.name}
            key={fields.currentPassword.key}
            defaultValue={fields.currentPassword.initialValue}
            disabled={isPending}
            id="currentPassword"
            className="input"
          />
          {fields.currentPassword.errors && (
            <p className="error-text">
              {fields.currentPassword.errors}
            </p>
          )}
        </label>

        <label htmlFor="newPassword">New Password: {" "}
          <input
            type="password"
            name={fields.newPassword.name}
            key={fields.newPassword.key}
            defaultValue={fields.newPassword.initialValue}
            disabled={isPending}
            id="newPassword"
            className="input ml-5!"
          />
          {fields.newPassword.errors && (
            <p className="error-text">
              {fields.newPassword.errors}
            </p>
          )}
        </label>

        <button
          type="submit"
          className="input w-fit!"
          disabled={isPending}
        >
          {isPending ? "Changing Password ..." : "Change Password"}
        </button>
      </Form>
    </>
  );
}