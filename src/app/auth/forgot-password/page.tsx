"use client";
import { useState } from 'react';
import { usePasswordReset } from '@/common/services/auth-api';
import { parseWithZod } from '@conform-to/zod';
import { forgotPasswordSchema } from '@/common/validations/auth.schema';
import { useForm } from '@conform-to/react';
import Header from '@/app/components/header';


export default function ForgotPasswordPage() {
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { mutate, isPending } = usePasswordReset();

  const [form, fields] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: forgotPasswordSchema });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const submission = parseWithZod(formData, { schema: forgotPasswordSchema });

    if (submission.status !== 'success') {
      if (submission.error?.username) {
        setError(submission.error.username[0]);
      }
      return;
    }

    const { username } = submission.value;

    sessionStorage.setItem('resetUsername', username);

    mutate(username, {
      onError: (error) => {
        sessionStorage.removeItem('resetUsername');
        setError(
          error.response?.data?.message
          || error.message
          || 'Failed to reset password'
        );
      }
    });
  };

  return (
    <>
      <Header text="Forgot Password" />
      <div className=' py-3 space-y-2 belowHeaderContainer'>
        <h1 className='text-xl font-bold'>Forgot Password</h1>
        <form
          id={form.id}
          onSubmit={handleSubmit}
        >
          <div>
            <label htmlFor="username">Username: </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="input"
              name={fields.username.name}
              key={fields.username.key}
              disabled={isPending}
              defaultValue={fields.username.initialValue}
            />
          </div>
          {error && <p className="error-text">{error}</p>}
          <button
            type="submit"
            disabled={isPending}
            className="button mt-1!"
          >
            {isPending ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      </div>
    </>
  );
}