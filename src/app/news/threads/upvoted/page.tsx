"use client";
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { useHeaderData } from '@/common/hooks/use-header-data';
import Header from '@/app/components/header';

interface UpvotedComment {
  id: string;
  content: string;
  createdAt: string;
  username: string;
  upvotes: number;
  downvotes: number;
  newsId: string;
  newsTitle: string;
}


export default function UpvotedCommentsPage() {
  const { data: headerData } = useHeaderData();
  const myUsername = headerData?.username;
  const { data: comments, isLoading } = useQuery<UpvotedComment[]>({
    queryKey: ['user-upvoted-comments'],
    queryFn: async () => {
      const res = await axios.get('/api/comments/upvoted');
      return res.data;
    },
    enabled: !!myUsername,
  });

  return (
    <>
      <Header />
      <main className="belowHeaderContainer">
        <div className="p-4 max-w-2xl mx-auto">
          <h1 className="text-xl font-semibold mb-4">Comments You&apos;ve Upvoted</h1>
          {isLoading ? (
            <div>Loading...</div>
          ) : comments && comments.length > 0 ? (
            <div className="space-y-6">
              {comments.map(comment => (
                <div key={comment.id} className="border-b pb-3">
                  <div className="text-xs text-muted mb-1">
                    {myUsername === comment.username && <span className="text-accent font-bold mr-1">*</span>}
                    <span className="font-semibold text-accent">{comment.username}</span>
                    {' '}• {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    {' '}• {comment.upvotes - comment.downvotes} point{Math.abs(comment.upvotes - comment.downvotes) === 1 ? '' : 's'}
                    <span className="ml-2">|</span>
                    <Link href={`/news/${comment.newsId}#comment-${comment.id}`} className="ml-1 text-xs text-accent-secondary hover:underline">context</Link>
                    <span className="ml-2">|</span>
                    <Link href={`/news/${comment.newsId}`} className="ml-1 text-xs text-accent hover:underline">{comment.newsTitle}</Link>
                  </div>
                  <div className="text-sm whitespace-pre-wrap">{comment.content}</div>
                </div>
              ))}
            </div>
          ) : (
            <div>No upvoted comments found.</div>
          )}
        </div>
      </main>
    </>
  );
} 