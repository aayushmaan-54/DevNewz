"use client";
import Header from '@/app/components/header';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';


export default function PasswordResetSentPage() {
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'no-email'>('idle');
  const router = useRouter();


  useEffect(() => {
    const username = sessionStorage.getItem('resetUsername');
    setStatus(username ? 'success' : 'error');
  }, []);


  return (
    <>
      <Header text="Reset Password Message" />
      <div className="py-3 belowHeaderContainer">
        {status === 'idle' && <p>Processing your request...</p>}

        {status === 'error' && (
          <div>
            <h1 className="text-2xl font-bold mb-4">Error</h1>
            <p>Invalid password reset request.</p>
            <button
              onClick={() => router.push('/auth/forgot-password')}
              className="button mt-2"
            >
              Try Again
            </button>
          </div>
        )}

        {status === 'success' && (
          <div>
            <h1 className="text-2xl font-bold mb-4">Request Received</h1>
            <p>
              If your account exists and has an email associated with it,
              you will receive a password reset link shortly.
            </p>
          </div>
        )}
      </div>
    </>
  );
}