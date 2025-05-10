"use client";
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { useHeaderData } from '@/common/hooks/use-header-data';
import Header from '@/app/components/header';

interface MySubmission {
  id: string;
  title: string;
  url: string | null;
  createdAt: string;
  username: string;
  upvotes: number;
  downvotes: number;
}

export default function MySubmissionsPage() {
  const { data: headerData } = useHeaderData();
  const myUsername = headerData?.username;
  const { data: news, isLoading } = useQuery<MySubmission[]>({
    queryKey: ['user-mysubmissions'],
    queryFn: async () => {
      const res = await axios.get('/api/news/mysubmissions');
      return res.data;
    },
    enabled: !!myUsername,
  });

  return (
    <>
      <Header />
      <main className="belowHeaderContainer">
        <div className="p-4 max-w-2xl mx-auto">
          <h1 className="text-xl font-semibold mb-4">Your Submitted News</h1>
          {isLoading ? (
            <div>Loading...</div>
          ) : news && news.length > 0 ? (
            <div className="space-y-6">
              {news.map(news => (
                <div key={news.id} className="border-b pb-3">
                  <div className="text-xs text-gray-500 mb-1">
                    <Link href={`/news/${news.id}`} className="font-semibold text-accent hover:underline">{news.title}</Link>
                    {news.url && (
                      <span className="ml-2 text-accent-secondary">(
                        <a href={news.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          {new URL(news.url).hostname.replace('www.', '')}
                        </a>)
                      </span>
                    )}
                    {' '}• by {news.username}
                    {' '}• {formatDistanceToNow(new Date(news.createdAt), { addSuffix: true })}
                    {' '}• {news.upvotes - news.downvotes} point{Math.abs(news.upvotes - news.downvotes) === 1 ? '' : 's'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>No submissions found.</div>
          )}
        </div>
      </main>
    </>
  );
} 