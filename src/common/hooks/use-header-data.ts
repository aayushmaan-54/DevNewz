'use client';
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface HeaderData {
  karma: number;
  username: string;
}


export function useHeaderData() {
  return useQuery<HeaderData | null>({
    queryKey: ['header-data'],
    queryFn: async () => {
      const response = await axios.get('/api/auth/user/header-data');
      return response.data?.data || null;
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: 2,
    retryDelay: 1000,
  });
}