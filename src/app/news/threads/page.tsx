"use client";
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useHeaderData } from '@/common/hooks/use-header-data';
import Header from '@/app/components/header';
import CommentThread from '../components/CommentThread';

interface UserComment {
  id: string;
  content: string;
  createdAt: string;
  username: string;
  upvotes: number;
  downvotes: number;
  newsId: string;
  newsTitle: string;
  parentCommentId: string | null;
  depth: number;
  children?: UserComment[];
}


export default function ThreadsPage() {
  const { data: headerData } = useHeaderData();
  const myUsername = headerData?.username;
  const { data: comments, isLoading } = useQuery<UserComment[]>({
    queryKey: ['user-threads'],
    queryFn: async () => {
      const res = await axios.get('/api/comments/threads');
      return res.data.data;
    },
    enabled: !!myUsername,
  });

  return (
    <>
      <Header />
      <main className="belowHeaderContainer">
        <div className="p-4 max-w-2xl mx-auto">
          <h1 className="text-xl font-semibold mb-4">Your Comments (Threads)</h1>
          {isLoading ? (
            <div>Loading...</div>
          ) : comments && comments.length > 0 ? (
            <CommentThread comments={comments} newsId={comments[0]?.newsId || ''} showContextAndTitleOnly={true} />
          ) : (
            <div>No comments found.</div>
          )}
        </div>
      </main>
    </>
  );
} 