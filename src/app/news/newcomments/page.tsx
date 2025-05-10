/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import Header from '../../components/header';
import { useHeaderData } from '@/common/hooks/use-header-data';
import { useGetNewestComments } from '@/common/services/news-api';
import CommentThread from '../components/CommentThread';

interface NewComment {
  id: string;
  content: string;
  createdAt: string;
  username: string;
  upvotes: number;
  downvotes: number;
  newsId: string;
  newsTitle: string;
}


export default function NewCommentsPage() {
  const { data: comments, isLoading } = useGetNewestComments();

  const { data: headerData } = useHeaderData();
  const myUsername = headerData?.username;

  return (
    <>
      <Header />
      <main className="belowHeaderContainer">
        <div className="p-4 max-w-2xl mx-auto">
          <h1 className="text-xl font-semibold mb-4">Newest Comments</h1>
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