"use client";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { logoutAction } from "@/app/auth/actions/logout-action";
import { useState } from "react";
import Link from "next/link";


export default function LogoutButton() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { data: authStatus, isLoading, error } = useQuery({
    queryKey: ['auth-status'],
    queryFn: async () => {
      const response = await axios.get('/api/auth/status', {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      return response.data;
    },
    staleTime: 0,
    refetchOnMount: true,
    retry: false,
  });

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const result = await logoutAction();
      if (result.success) {
        // Add a small delay to ensure cookies are deleted
        await new Promise(resolve => setTimeout(resolve, 100));
        window.location.href = '/auth';
      }
    } catch (error) {
      console.error("Logout failed:", error);
      window.location.href = '/auth';
    } finally {
      setIsLoggingOut(false);
    }
  };


  if (isLoading) {
    return <button className="link-2 cursor-pointer" disabled>Loading...</button>;
  }

  if (error || !authStatus?.data?.isAuthenticated) {
    return <Link href="/auth" className="link-2 cursor-pointer">Auth</Link>;
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="link-2 cursor-pointer"
      aria-busy={isLoggingOut}
    >
      {isLoggingOut ? "Logging out..." : "Logout"}
    </button>
  );
}