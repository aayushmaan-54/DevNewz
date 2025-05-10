/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import Header from "../components/header";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useSearchParams, useRouter } from 'next/navigation';
import { voteAction } from "./actions/vote-action";
import { Suspense } from "react";

interface NewsWithVelocity {
  id: string;
  title: string;
  url: string | null;
  createdAt: Date;
  upvotes: number;
  downvotes: number;
  username: string;
  commentCount: number;
  userKarma: number;
  userVote?: 'upvote' | 'downvote' | null;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalNews: number;
  pageSize: number;
}


export default function NewsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1');
  const queryClient = useQueryClient();

  const {
    data,
    isLoading
  } = useQuery<{
    data: NewsWithVelocity[],
    pagination: PaginationInfo
  }>({
    queryKey: ['news', currentPage],
    queryFn: async () => {
      const response = await axios.get(`/api/news?page=${currentPage}`);
      return response.data;
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const voteMutation = useMutation({
    mutationFn: async (
      { newsId, voteType }:
        { newsId: string, voteType: 'upvote' | 'downvote' }) => {
      const result = await voteAction(newsId, voteType);
      if (!result.success) {
        throw new Error(result.error || 'Voting failed');
      }
      return result;
    },
    onSuccess: (result, variables) => {
      queryClient.setQueryData(['news', currentPage], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: oldData.data.map((news: NewsWithVelocity) => {
            if (news.id === variables.newsId) {
              const wasUpvoted = news.userVote === 'upvote';
              const wasDownvoted = news.userVote === 'downvote';
              const isUpvoting = result.data?.userVote === 'upvote';
              const isDownvoting = result.data?.userVote === 'downvote';
              const isRemovingVote = result.data?.userVote === null;

              let newUpvotes = news.upvotes;
              let newDownvotes = news.downvotes;

              if (isUpvoting) {
                newUpvotes = wasDownvoted ? news.upvotes + 1 : (wasUpvoted ? news.upvotes - 1 : news.upvotes + 1);
                newDownvotes = wasDownvoted ? news.downvotes - 1 : news.downvotes;
              } else if (isDownvoting) {
                newUpvotes = wasUpvoted ? news.upvotes - 1 : news.upvotes;
                newDownvotes = wasUpvoted ? news.downvotes + 1 : (wasDownvoted ? news.downvotes - 1 : news.downvotes + 1);
              } else if (isRemovingVote) {
                newUpvotes = wasUpvoted ? news.upvotes - 1 : news.upvotes;
                newDownvotes = wasDownvoted ? news.downvotes - 1 : news.downvotes;
              }

              return {
                ...news,
                userVote: result.data?.userVote,
                upvotes: newUpvotes,
                downvotes: newDownvotes
              };
            }
            return news;
          })
        };
      });
    },
  });


  const calculateVelocity = (news: NewsWithVelocity) => {
    const hoursSinceCreation = (new Date().getTime() - new Date(news.createdAt).getTime()) / (1000 * 60 * 60);
    return (news.upvotes - news.downvotes) / (hoursSinceCreation + 2);
  };


  const sortedNews = data?.data.sort(
    (a, b) => calculateVelocity(b) - calculateVelocity(a)
  );

  const canDownvote = (userKarma: number) => userKarma >= 500;

  const handleVote = (newsId: string, voteType: 'upvote' | 'downvote', userKarma: number) => {
    if (voteType === 'downvote' && !canDownvote(userKarma)) {
      alert('You need at least 500 karma to downvote');
      return;
    }
    voteMutation.mutate({ newsId, voteType });
  };

  const handlePageChange = (newPage: number) => {
    router.push(`/news?page=${newPage}`);
  };


  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <Header />
        <main className="belowHeaderContainer">
          {isLoading ? (
            <div>Loading News...</div>
          ) : (
            <>
              <div className="space-y-2 p-2">
                {sortedNews?.map((news, index) => (
                  <div key={news.id} className="flex">
                    <span className="text-muted w-6 text-right mr-1">
                      {(currentPage - 1) * 30 + index + 1}.
                    </span>
                    <div className="flex flex-col items-center mr-2 w-6">
                      <button
                        onClick={() => handleVote(news.id, 'upvote', news.userKarma)}
                        className={`${news.userVote === 'upvote' ? 'text-accent font-bold' : 'text-gray-500'} hover:text-orange-500 cursor-pointer`}
                        disabled={voteMutation.isPending}
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => handleVote(news.id, 'downvote', news.userKarma)}
                        className={`${news.userVote === 'downvote' ? 'text-accent-secondary' : 'text-muted'} hover:text-blue-500`}
                        disabled={voteMutation.isPending || !canDownvote(news.userKarma)}
                        style={{ display: news.userKarma >= 500 ? 'block' : 'none' }}
                      >
                        ▼
                      </button>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-baseline">
                        <Link
                          href={news.url || `/news/${news.id}`}
                          className="text-sm hover:underline"
                          target={news.url ? "_blank" : "_self"}
                        >
                          {news.title}
                        </Link>
                        {news.url && (
                          <span className="text-xs text-muted ml-1">
                            ({new URL(news.url).hostname.replace('www.', '')})
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted">
                        {news.upvotes - news.downvotes} points by {news.username} {formatDistanceToNow(new Date(news.createdAt), { addSuffix: true })} |
                        <Link href={`/news/${news.id}`} className="hover:underline ml-1">
                          {news.commentCount} {news.commentCount === 1 ? 'comment' : 'comments'}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {data?.pagination && (
                <div className="flex justify-center items-center space-x-2 p-4">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm">
                    Page {currentPage} of {data.pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === data.pagination.totalPages}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </Suspense>
    </>
  );
}