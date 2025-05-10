import { useState } from 'react';
import CommentForm from './CommentForm';
import { formatDistanceToNow } from 'date-fns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useHeaderData } from '@/common/hooks/use-header-data';
import Link from 'next/link';

export type Comment = {
  id: string;
  content: string;
  createdAt: string;
  username: string;
  upvotes: number;
  downvotes: number;
  parentCommentId: string | null;
  depth: number;
  userVote?: 'upvote' | 'downvote' | null;
  children?: Comment[];
  newsId: string;
  newsTitle: string;
};

interface CommentThreadProps {
  comments: Comment[];
  newsId: string;
  depth?: number;
  parentMap?: Record<string, string | null>;
  showContextAndTitleOnly?: boolean;
}

export default function CommentThread({ comments, newsId, depth = 0, parentMap, showContextAndTitleOnly }: CommentThreadProps) {
  return (
    <div>
      {comments.map(comment => (
        <CommentNode
          key={comment.id}
          comment={comment}
          newsId={newsId}
          depth={depth}
          parentMap={parentMap}
          showContextAndTitleOnly={showContextAndTitleOnly}
        />
      ))}
    </div>
  );
}

function CommentNode({
  comment,
  newsId,
  depth,
  parentMap,
  showContextAndTitleOnly
}: {
  comment: Comment;
  newsId: string;
  depth: number;
  parentMap?: Record<string, string | null>;
  showContextAndTitleOnly?: boolean;
}) {
  const [showReply, setShowReply] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const queryClient = useQueryClient();
  const { data: headerData } = useHeaderData();
  const userKarma = headerData?.karma || 0;
  const isMine = headerData?.username === comment.username;

  const voteMutation = useMutation({
    mutationFn: async (voteType: 'upvote' | 'downvote') => {
      await axios.post('/api/vote', { 
        commentId: comment.id, voteType 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', newsId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await axios.delete(`/api/news/${newsId}/comments`, { 
        data: { commentId: comment.id } 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', newsId] });
    },
  });

  const editMutation = useMutation({
    mutationFn: async () => {
      await axios.patch(`/api/news/${newsId}/comments`, { 
        commentId: comment.id, content: editContent 
      });
    },
    onSuccess: () => {
      setEditing(false);
      queryClient.invalidateQueries({ queryKey: ['comments', newsId] });
    },
  });

  const parentLabel = comment.parentCommentId
    ? (depth === 1
      ? 'parent'
      : depth === 0
        ? 'root'
        : 'parent')
    : 'root';

  if (collapsed) {
    const countChildren = (c: Comment): number => (
      c.children ? c.children.reduce((acc, cc) => acc + 1 + countChildren(cc), 0) : 0
    );

    const moreCount = countChildren(comment);

    return (
      <div className="pl-2 border-l border-accent/20 mt-2 text-xs text-muted cursor-pointer select-none" onClick={() => setCollapsed(false)}>
        [{moreCount + 1} more]
      </div>
    );
  }

  return (
    <div className="pl-2 border-l border-accent/20 mt-2">
      <div className="flex items-center text-xs text-muted mb-1">
        {isMine && <span className="text-accent font-bold mr-1">*</span>}
        <span className={`font-semibold ${isMine ? 'text-accent' : 'text-accent'}`}>{comment.username}</span>
        {' '}• {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
        {' '}• {comment.upvotes - comment.downvotes} point{Math.abs(comment.upvotes - comment.downvotes) === 1 ? '' : 's'}
        {showContextAndTitleOnly && <><span className="ml-2">|</span>
        <Link href={`/news/${comment.newsId}#comment-${comment.id}`} className="ml-1 text-xs text-accent-secondary hover:underline">context</Link>
        <span className="ml-2">|</span>
        <Link href={`/news/${comment.newsId}`} className="ml-1 text-xs text-accent hover:underline">{comment.newsTitle}</Link></>}
        {!showContextAndTitleOnly && isMine && (
          <>
            <span className="ml-2">|</span>
            <button className="ml-1 text-xs text-muted hover:underline cursor-pointer" onClick={() => setEditing(true)}>edit</button>
            <span className="ml-1">|</span>
            <button className="ml-1 text-xs text-muted hover:underline cursor-pointer" onClick={() => deleteMutation.mutate()}>delete</button>
          </>
        )}
        <button
          className="ml-2 text-accent hover:underline cursor-pointer"
          onClick={() => setCollapsed(true)}
        >
          [-]
        </button>
        <span className="ml-2">
          |
          <span className="ml-1 text-muted">{parentLabel}</span>
        </span>
      </div>
      <div className="flex items-center gap-2 mb-1">
        {!showContextAndTitleOnly && (
          <>
            <button
              className={`text-xs ${comment.userVote === 'upvote' ? 'text-accent font-bold' : 'text-muted'} hover:text-orange-500 cursor-pointer`}
              onClick={() => voteMutation.mutate('upvote')}
              disabled={voteMutation.isPending}
            >▲</button>
            <button
              className={`text-xs ${comment.userVote === 'downvote' ? 'text-accent-secondary' : 'text-muted'} hover:text-accent-secondary cursor-pointer`}
              onClick={() => voteMutation.mutate('downvote')}
              disabled={voteMutation.isPending || userKarma < 500}
              style={{ display: userKarma >= 500 ? 'inline' : 'none' }}
            >▼</button>
          </>
        )}
      </div>
      {editing ? (
        <form
          className="mb-2"
          onSubmit={e => {
            e.preventDefault();
            editMutation.mutate();
          }}
        >
          <textarea
            className="w-full! text-sm! mb-1! input"
            rows={3}
            value={editContent}
            onChange={e => setEditContent(e.target.value)}
            disabled={editMutation.isPending}
          />
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="button disabled:opacity-50"
              disabled={editMutation.isPending}
            >
              {editMutation.isPending ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              className="button hover:bg-gray-400"
              onClick={() => setEditing(false)}
              disabled={editMutation.isPending}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="text-sm whitespace-pre-wrap mb-1">{comment.content}</div>
      )}
      {!showContextAndTitleOnly && depth < 5 && (
        <button
          className="text-xs text-accent hover:underline mr-2 cursor-pointer"
          onClick={() => setShowReply(v => !v)}
        >
          {showReply ? 'Cancel' : 'Reply'}
        </button>
      )}
      {showReply && !showContextAndTitleOnly && (
        <div className="mt-1 mb-2">
          <CommentForm
            newsId={newsId}
            parentCommentId={comment.id}
            depth={depth + 1}
            onSuccess={() => setShowReply(false)}
          />
        </div>
      )}
      {comment.children && comment.children.length > 0 && depth < 5 && (
        <CommentThread comments={comment.children} newsId={newsId} depth={depth + 1} parentMap={parentMap} showContextAndTitleOnly={showContextAndTitleOnly} />
      )}
    </div>
  );
} 