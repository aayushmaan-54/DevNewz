import { useQuery } from "@tanstack/react-query";
import axios from "axios";



export const getUserProfile = async () => {
  const res = await axios.get('/api/auth/user/profile', {
    withCredentials: true
  });
  return res.data;
};


export const useUserProfile = () => {
  return useQuery({
    queryKey: ['userProfile'],
    queryFn: getUserProfile,
    staleTime: 30 * 60 * 1000,
    retry: false,
  });
};