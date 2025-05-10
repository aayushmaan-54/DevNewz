import { useQuery } from "@tanstack/react-query";
import axios from "axios";



export const getAskNews = async () => {
  const response = await axios.get('/api/news/ask');
  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to fetch ask news');
  }
  return response.data.data;
};


export const getNewestComments = async () => {
  const response = await axios.get('/api/comments/newest');
  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to fetch newest comments');
  }
  return response.data.data;
};


export const getNewestNews = async () => {
  const response = await axios.get('/api/news/newest');
  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to fetch newest news');
  }
  return response.data.data;
};


export const getShowNews = async () => {
  const response = await axios.get('/api/news/show');
  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to fetch show news');
  }
  return response.data.data;
};



export const useGetAskNews = () => {
  return useQuery({
    queryKey: ['news', 'ask'],
    queryFn: getAskNews,
  });
};


export const useGetNewestComments = () => {
  return useQuery({
    queryKey: ['newest-comments'],
    queryFn: getNewestComments,
  });
};


export const useGetNewestNews = () => {
  return useQuery({
    queryKey: ['newest-news'],
    queryFn: getNewestNews,
  });
};


export const useGetShowNews = () => {
  return useQuery({
    queryKey: ['news', 'show'],
    queryFn: getShowNews,
  });
};