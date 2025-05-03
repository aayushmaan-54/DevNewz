'use client';
import { useActionState } from "react";
import Form from "next/form";
import { guestLoginAction } from "../actions/guest-login-action";


export default function ContinueAsGuest() {
  const [state, action, isPending] = useActionState(guestLoginAction, null);

  return (
    <Form action={action}>
      <button
        type="submit"
        className="button w-fit mt-2"
        disabled={isPending}
        aria-disabled={isPending}
      >
        {isPending ? "Creating guest account..." : "Continue as Guest"}
      </button>
      {!state?.success && (
        <p className='error-text'>
          {state?.message}
        </p>
      )}
    </Form>
  );
}