/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";


export const requestPasswordReset = async (username: string) => {
  const response = await axios.post(`/api/auth/forgot-password`, {
    username
  });
  return response.data;
};


export const usePasswordReset = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: requestPasswordReset,
    onSuccess: () => {
      router.push('/auth/reset-password/sent');
    },
    onError: (error: any) => {
      console.error('Password reset error:', error.message);
      return error;
    }
  });
};