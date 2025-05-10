/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Header from '../../components/header';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { useGetNewestNews } from '@/common/services/news-api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { voteAction } from '../actions/vote-action';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

interface NewestNews {
  id: string;
  title: string;
  url: string | null;
  createdAt: string;
  username: string;
  upvotes: number;
  downvotes: number;
  commentCount?: number;
  userKarma?: number;
  userVote?: 'upvote' | 'downvote' | null;
}

export default function NewestNewsPage() {
  const { data: news, isLoading } = useGetNewestNews();
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = 1;

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
      queryClient.setQueryData(['newest-news'], (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.map((item: NewestNews) => {
          if (item.id === variables.newsId) {
            const wasUpvoted = item.userVote === 'upvote';
            const wasDownvoted = item.userVote === 'downvote';
            const isUpvoting = result.data?.userVote === 'upvote';
            const isDownvoting = result.data?.userVote === 'downvote';
            const isRemovingVote = result.data?.userVote === null;

            let newUpvotes = item.upvotes;
            let newDownvotes = item.downvotes;

            if (isUpvoting) {
              newUpvotes = wasDownvoted ? item.upvotes + 1 : (wasUpvoted ? item.upvotes - 1 : item.upvotes + 1);
              newDownvotes = wasDownvoted ? item.downvotes - 1 : item.downvotes;
            } else if (isDownvoting) {
              newUpvotes = wasUpvoted ? item.upvotes - 1 : item.upvotes;
              newDownvotes = wasUpvoted ? item.downvotes + 1 : (wasDownvoted ? item.downvotes - 1 : item.downvotes + 1);
            } else if (isRemovingVote) {
              newUpvotes = wasUpvoted ? item.upvotes - 1 : item.upvotes;
              newDownvotes = wasDownvoted ? item.downvotes - 1 : item.downvotes;
            }

            return {
              ...item,
              userVote: result.data?.userVote,
              upvotes: newUpvotes,
              downvotes: newDownvotes
            };
          }
          return item;
        });
      });
    },
  });

  const handleVote = (newsId: string, voteType: 'upvote' | 'downvote', userKarma: number = 0) => {
    if (voteType === 'downvote' && userKarma < 500) {
      alert('You need at least 500 karma to downvote');
      return;
    }
    voteMutation.mutate({ newsId, voteType });
  };

  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <Header />
        <main className="belowHeaderContainer">
          <div className="space-y-2 p-2">
            <h1 className="text-xl font-semibold mb-4">Newest News</h1>
            {isLoading ? (
              <div>Loading...</div>
            ) : news && news.length > 0 ? (
              news.map((item: NewestNews, index: number) => (
                <div key={item.id} className="flex">
                  <span className="text-muted w-6 text-right mr-1">
                    {index + 1}.
                  </span>
                  <div className="flex flex-col items-center mr-2 w-6">
                    <button
                      onClick={() => handleVote(item.id, 'upvote', item.userKarma || 0)}
                      className={`${item.userVote === 'upvote' ? 'text-accent font-bold' : 'text-gray-500'} hover:text-orange-500 cursor-pointer`}
                      disabled={voteMutation.isPending}
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => handleVote(item.id, 'downvote', item.userKarma || 0)}
                      className={`${item.userVote === 'downvote' ? 'text-accent-secondary' : 'text-muted'} hover:text-blue-500`}
                      disabled={voteMutation.isPending || (item.userKarma || 0) < 500}
                      style={{ display: (item.userKarma || 0) >= 500 ? 'block' : 'none' }}
                    >
                      ▼
                    </button>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-baseline">
                      <Link
                        href={item.url || `/news/${item.id}`}
                        className="text-sm hover:underline"
                        target={item.url ? "_blank" : "_self"}
                      >
                        {item.title}
                      </Link>
                      {item.url && (
                        <span className="text-xs text-muted ml-1">
                          ({new URL(item.url).hostname.replace('www.', '')})
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted">
                      {item.upvotes - item.downvotes} points by {item.username} {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                      {typeof item.commentCount === 'number' && (
                        <>
                          {' '}|
                          <Link href={`/news/${item.id}`} className="hover:underline ml-1">
                            {item.commentCount} {item.commentCount === 1 ? 'comment' : 'comments'}
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div>No news found.</div>
            )}
          </div>
        </main>
      </Suspense>
    </>
  );
} 