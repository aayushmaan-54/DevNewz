"use client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { useHeaderData } from '@/common/hooks/use-header-data';
import Header from '@/app/components/header';
import { useState } from 'react';
import { z } from 'zod';

const editNewsSchema = z
  .object({
    title: z
      .string()
      .min(10, { message: "Title too short (10+ chars)" })
      .max(50, { message: "Title too long (max 50 chars)" }),

    url: z
      .string()
      .url({ message: "Invalid URL format" })
      .max(2048, { message: "URL too long" })
      .optional()
      .or(z.literal("")),

    content: z
      .string()
      .min(30, { message: "News too short (30+ chars)" })
      .max(150, { message: "News too long (max 150 chars)" })
      .optional()
      .or(z.literal("")),
  })
  .refine(data => !(data.url && data.content), {
    message: "Cannot submit both URL and text. Choose one.",
    path: ["content"],
  })
  .refine(data => data.url || data.content, {
    message: "Either URL or text must be provided.",
    path: ["url"],
  });

interface MySubmission {
  id: string;
  title: string;
  url: string | null;
  content: string | null;
  createdAt: string;
  username: string;
  upvotes: number;
  downvotes: number;
}

export default function MySubmissionsPage() {
  const { data: headerData } = useHeaderData();
  const myUsername = headerData?.username;
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editContent, setEditContent] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const { data: news, isLoading } = useQuery<MySubmission[]>({
    queryKey: ['user-mysubmissions'],
    queryFn: async () => {
      const res = await axios.get('/api/news/mysubmissions');
      return res.data.data;
    },
    enabled: !!myUsername,
  });

  const editMutation = useMutation({
    mutationFn: async ({ id, title, url, content }: { id: string; title: string; url: string | null; content: string | null }) => {
      try {
        const result = editNewsSchema.safeParse({ title, url, content });
        if (!result.success) {
          const errors = result.error.errors.map(err => err.message);
          throw new Error(errors.join(', '));
        }
        await axios.patch(`/api/news/${id}`, { title, url, content });
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('An unexpected error occurred');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-mysubmissions'] });
      setEditingId(null);
      setValidationError(null);
    },
    onError: (error: Error) => {
      setValidationError(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/api/news/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-mysubmissions'] });
    },
  });

  const handleEdit = (news: MySubmission) => {
    setEditingId(news.id);
    setEditTitle(news.title);
    setEditUrl(news.url || '');
    setEditContent(news.content || '');
    setValidationError(null);
  };

  const handleSave = (id: string) => {
    editMutation.mutate({
      id,
      title: editTitle,
      url: editUrl || null,
      content: editContent || null,
    });
  };

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
                  {editingId === news.id ? (
                    <div className="space-y-2">
                      {validationError && (
                        <div className="text-red-500 text-sm mb-2">{validationError}</div>
                      )}
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="input w-full"
                        placeholder="Title"
                      />
                      <input
                        type="text"
                        value={editUrl}
                        onChange={(e) => setEditUrl(e.target.value)}
                        className="input w-full"
                        placeholder="URL (optional)"
                      />
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="input w-full"
                        rows={3}
                        placeholder="Content (optional)"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSave(news.id)}
                          className="button"
                          disabled={editMutation.isPending}
                        >
                          {editMutation.isPending ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setValidationError(null);
                          }}
                          className="button hover:bg-gray-400"
                          disabled={editMutation.isPending}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
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
                      {news.content && (
                        <div className="text-sm whitespace-pre-wrap mb-2">{news.content}</div>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(news)}
                          className="text-xs text-accent hover:underline"
                        >
                          edit
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this post?')) {
                              deleteMutation.mutate(news.id);
                            }
                          }}
                          className="text-xs text-accent hover:underline"
                          disabled={deleteMutation.isPending}
                        >
                          {deleteMutation.isPending ? 'deleting...' : 'delete'}
                        </button>
                      </div>
                    </>
                  )}
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