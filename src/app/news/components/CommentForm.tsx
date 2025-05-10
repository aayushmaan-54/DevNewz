/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

interface CommentFormProps {
  newsId: string;
  parentCommentId?: string | null;
  onSuccess?: () => void;
  depth?: number;
}

export default function CommentForm({ newsId, parentCommentId = null, onSuccess, depth = 0 }: CommentFormProps) {
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post(`/api/news/${newsId}/comments`, {
        content,
        parentCommentId,
      });
      return res.data;
    },
    onSuccess: () => {
      setContent('');
      setError(null);
      queryClient.invalidateQueries({ queryKey: ['comments', newsId] });
      if (onSuccess) onSuccess();
    },
    onError: (err: any) => {
      setError(err?.response?.data?.error || 'Failed to post comment');
    },
  });

  if (depth !== undefined && depth >= 5) {
    return <div className="text-xs text-accent">Maximum reply depth reached.</div>;
  }

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        if (!content.trim()) return setError('Comment cannot be empty');
        mutation.mutate();
      }}
    >
      <textarea
        className="w-full! input text-sm! mb-1!"
        rows={3}
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Add a comment..."
        disabled={mutation.isPending}
      />
      <div className="flex items-center gap-2">
        <button
          type="submit"
          className="button disabled:opacity-50"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Posting...' : 'Post'}
        </button>
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    </form>
  );
} 