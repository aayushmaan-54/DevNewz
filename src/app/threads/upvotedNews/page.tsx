"use client";
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { useHeaderData } from '@/common/hooks/use-header-data';
import Header from '@/app/components/header';

interface UpvotedNews {
  id: string;
  title: string;
  url: string | null;
  createdAt: string;
  username: string;
  upvotes: number;
  downvotes: number;
  commentCount: number;
}

export default function UpvotedNewsPage() {
  const { data: headerData } = useHeaderData();
  const myUsername = headerData?.username;
  const { data: news, isLoading } = useQuery<UpvotedNews[]>({
    queryKey: ['user-upvoted-news'],
    queryFn: async () => {
      const res = await axios.get('/api/news/upvoted');
      return res.data.data;
    },
    enabled: !!myUsername,
  });

  return (
    <>
      <Header />
      <main className="belowHeaderContainer">
        <div className="p-4 max-w-2xl mx-auto">
          <h1 className="text-xl font-semibold mb-4">News You&apos;ve Upvoted</h1>
          {isLoading ? (
            <div>Loading...</div>
          ) : news && news.length > 0 ? (
            <div className="space-y-2">
              {news.map((item, index) => (
                <div key={item.id} className="flex">
                  <span className="text-muted w-6 text-right mr-1">
                    {index + 1}.
                  </span>
                  <div className="flex-1">
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
                      {item.upvotes - item.downvotes} points by {item.username} {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })} |
                      <Link href={`/news/${item.id}`} className="hover:underline ml-1">
                        {item.commentCount} {item.commentCount === 1 ? 'comment' : 'comments'}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>No upvoted news found.</div>
          )}
        </div>
      </main>
    </>
  );
} 