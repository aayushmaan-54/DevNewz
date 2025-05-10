/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useParams } from "next/navigation";
import Header from "@/app/components/header";
import CommentForm from "../components/CommentForm";
import CommentThread from "../components/CommentThread";


interface News {
  id: string;
  title: string;
  url: string | null;
  content: string | null;
  createdAt: Date;
  upvotes: number;
  downvotes: number;
  username: string;
  commentCount: number;
  userKarma: number;
  userVote?: 'upvote' | 'downvote' | null;
}

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  username: string;
  upvotes: number;
  downvotes: number;
  parentCommentId: string | null;
  depth: number;
  children?: Comment[];
};



export default function NewsPage() {
  const params = useParams();
  const newsId = params.id as string;


  const { data: news, isLoading } = useQuery<News>({
    queryKey: ['news', newsId],
    queryFn: async () => {
      const response = await axios.get(`/api/news/${newsId}`);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch news');
      }
      return response.data.data;
    },
  });


  const { data: comments, isLoading: commentsLoading } = useQuery<Comment[]>({
    queryKey: ["comments", newsId],
    queryFn: async () => {
      const response = await axios.get(`/api/news/${newsId}/comments`);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch comments');
      }
      return response.data.data;
    },
  });

  const safeFormatDistance = (date: Date | string) => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) throw new Error('Invalid date');
    return formatDistanceToNow(dateObj, { addSuffix: true });
  } catch (e) {
    console.error('Date formatting error:', e);
    return '';
  }
};

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="belowHeaderContainer">
          <div className="p-4">Loading news...</div>
        </main>
      </>
    );
  }

  if (!news) {
    return (
      <>
        <Header />
        <main className="belowHeaderContainer">
          <div className="p-4">News not found</div>
        </main>
      </>
    );
  }

  function addNewsInfoToComments(comments: Comment[] = []): any[] {
    return comments.map(comment => ({
      ...comment,
      newsId,
      newsTitle: news?.title || '',
      children: comment.children ? addNewsInfoToComments(comment.children) : [],
    }));
  }

  const commentsWithNews = addNewsInfoToComments(comments);

  return (
    <>
      <Header />
      <main className="belowHeaderContainer">
        <div className="p-4">
          <div className="mb-4">
            <h1 className="text-xl font-semibold mb-2">{news.title}</h1>
            {news.url && (
              <div className="text-sm text-muted mb-2">
                <a 
                  href={news.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {new URL(news.url).hostname.replace('www.', '')}
                </a>
              </div>
            )}
            <div className="text-sm text-muted">
              {news.upvotes - news.downvotes} points by {news.username} {safeFormatDistance(new Date(news.createdAt))}
            </div>
          </div>

          {news.content && (
            <div className="mb-4 text-sm whitespace-pre-wrap">
              {news.content}
            </div>
          )}

          <div className="text-sm text-muted">
            <Link href="/news" className="hover:underline">
              ← back to news
            </Link>
          </div>

          <div className="mt-8">
            <h2 className="font-semibold mb-2">Comments</h2>
            <CommentForm newsId={newsId} depth={0} />
            {commentsLoading ? (
              <div>Loading comments...</div>
            ) : comments && comments.length > 0 ? (
              <div className="mt-8">
                <CommentThread comments={commentsWithNews} newsId={newsId} depth={0} />
              </div>
            ) : (
              <div>No comments yet.</div>
            )}
          </div>
        </div>
      </main>
    </>
  );
} 