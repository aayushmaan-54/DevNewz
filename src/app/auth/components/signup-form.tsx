"use client";
import { signupSchema } from '@/common/validations/auth.schema';
import { useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import Form from 'next/form';
import { useActionState } from 'react';
import { signupAction } from '../actions/signup-action';


export default function SignupForm() {
  const [lastResult, action, isPending] = useActionState(signupAction, null);

  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: signupSchema,
      });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  return (
    <>
      <Form
        action={action}
        id={form.id}
        onSubmit={form.onSubmit}
        className='flex flex-col w-fit gap-2 mt-3'
      >
        {(lastResult && lastResult.status !== "success" && form.errors) && (
          <p className="error-text">{form.errors}</p>
        )}
        <label htmlFor="username-signup">username:{" "}
          <input
            type="text"
            id="username-signup"
            className="input"
            name={fields.username.name}
            key={fields.username.key}
            defaultValue={fields.username.initialValue}
            disabled={isPending}
          />
          {fields.username.errors && (
            <p id={`${fields.username.id}-error`} className="error-text">
              {fields.username.errors}
            </p>
          )}
        </label>

        <label htmlFor="password-signup">password:{" "}
          <input
            type="password"
            id="password-signup"
            className="input"
            name={fields.password.name}
            key={fields.password.key}
            defaultValue={fields.password.initialValue}
            disabled={isPending}
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
          {isPending ? "Creating account..." : "Create account"}
        </button>
      </Form>
    </>
  );
}