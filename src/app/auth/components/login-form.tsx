"use client";
import { loginSchema } from "@/common/validations/auth.schema";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import Form from "next/form";
import { loginAction } from "../actions/login-action";
import { useActionState } from "react";


export default function LoginForm() {
  const [lastResult, action, isPending] = useActionState(loginAction, null);

  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: loginSchema,
      });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  return (
    <>
      <Form
        className='flex flex-col w-fit gap-2 mt-3'
        id={form.id}
        onSubmit={form.onSubmit}
        action={action}
      >
        {(lastResult && lastResult.status !== "success" && form.errors) && (
          <p className="error-text">{form.errors}</p>
        )}
        <label htmlFor="username">username:{" "}
          <input
            type="text"
            name={fields.username.name}
            key={fields.username.key}
            defaultValue={fields.username.initialValue}
            id="username"
            className="input"
            disabled={isPending}
          />
          {fields.username.errors && (
            <p id={`${fields.username.id}-error`} className="error-text">
              {fields.username.errors}
            </p>
          )}
        </label>

        <label htmlFor="password">password:{" "}
          <input
            type="password"
            name={fields.password.name}
            key={fields.password.key}
            defaultValue={fields.password.initialValue}
            disabled={isPending}
            id="password"
            className="input"
          />
          {fields.password.errors && (
            <p id={`${fields.password.id}-error`} className="error-text">
              {fields.password.errors}
            </p>
          )}
        </label>

        <button
          type="submit"
          className="input"
          disabled={isPending}
        >
          {isPending ? "Logging In..." : "Login"}
        </button>
      </Form>
    </>
  );
}