/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import Header from "../../components/header";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { voteAction } from '../actions/vote-action';
import { useSearchParams } from 'next/navigation';
import axios from "axios";
import { Suspense } from 'react';

interface News {
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

function AskPageContent() {
  const searchParams = useSearchParams();
  const pageParam = searchParams.get('page');
  const page = pageParam ? parseInt(pageParam) : 1;

  const { data: newsData, isLoading } = useQuery({
    queryKey: ['news', 'ask', page],
    queryFn: async () => {
      const response = await axios.get(`/api/news/ask?page=${page}`);
      return response.data;
    },
  });

  const news = newsData?.data || [];
  const pagination = newsData?.pagination;
  const queryClient = useQueryClient();

  const voteMutation = useMutation({
    mutationFn: async (
      { newsId, voteType }: { newsId: string, voteType: 'upvote' | 'downvote' }) => {
      const result = await voteAction(newsId, voteType);
      if (!result.success) {
        throw new Error(result.error || 'Voting failed');
      }
      return result;
    },
    onSuccess: (result, variables) => {
      queryClient.setQueryData(['news', 'ask'], (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.map((news: News) => {
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
        });
      });
    },
  });

  const handleVote = (newsId: string, voteType: 'upvote' | 'downvote', userKarma: number) => {
    if (voteType === 'downvote' && userKarma < 500) {
      alert('You need at least 500 karma to downvote');
      return;
    }
    voteMutation.mutate({ newsId, voteType });
  };

  return (
    <>
      <Header text="Ask DevNewz" />
      <main className="belowHeaderContainer">
        <div className="p-4">
          {isLoading ? (
            <div>Loading news...</div>
          ) : (
            <div className="space-y-2">
              {news?.map((news: News, index: number) => (
                <div key={news.id} className="flex">
                  <span className="text-muted w-6 text-right mr-1">{index + 1}.</span>
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
                      disabled={voteMutation.isPending || news.userKarma < 500}
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
          )}

          {!isLoading && (!news || news.length === 0) && (
            <div className="text-muted mt-4">No ask news found.</div>
          )}

          {/* Pagination Controls */}
          {pagination && (
            <div className="flex justify-center items-center space-x-2 p-4">
              <button
                onClick={() => {
                  if (page > 1) {
                    window.location.href = `/ask?page=${page - 1}`;
                  }
                }}
                disabled={page === 1}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => {
                  if (news.length > 0 && page < pagination.totalPages) {
                    window.location.href = `/ask?page=${page + 1}`;
                  }
                }}
                disabled={news.length === 0 || page === pagination.totalPages}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default function AskPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AskPageContent />
    </Suspense>
  );
} 