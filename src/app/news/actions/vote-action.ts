/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { db } from "@/common/lib/db";
import { decodedAuthToken } from "@/common/utils/auth";
import { KARMA_POINTS, updateUserKarma } from "@/common/utils/karma";
import { revalidatePath } from "next/cache";


export async function voteAction(newsId: string, voteType: 'upvote' | 'downvote') {
  try {
    const { userId } = await decodedAuthToken() as any;
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { karma: true }
    });

    if (voteType === 'downvote' && (user?.karma || 0) < 500) {
      return { success: false, error: 'You need at least 500 karma to downvote' };
    }

    let result;
    if (voteType === 'upvote') {
      result = await handleUpvote(userId, newsId);
    } else {
      result = await handleDownvote(userId, newsId);
    }

    revalidatePath('/news');
    return {
      success: true,
      message: 'Vote successful',
      data: {
        userVote: result.userVote,
      }
    };
  } catch (error) {
    console.error('Vote action error:', error);
    return { success: false, error: 'Voting failed' };
  }
}


async function handleUpvote(userId: string, newsId: string) {
  const existing = await db.newsUpvote.findFirst({ where: { userId, newsId } });
  const news = await db.news.findUnique({
    where: { id: newsId },
    select: { userId: true }
  });

  if (!news) {
    throw new Error('News not found');
  }

  if (existing) {
    await db.newsUpvote.delete({ where: { id: existing.id } });
    // Remove karma points when removing upvote
    await updateUserKarma(news.userId, -KARMA_POINTS.RECEIVE_NEWS_UPVOTE);
    return { success: true, userVote: null };
  } else {
    await db.newsUpvote.create({ data: { userId, newsId } });
    await db.newsDownvote.deleteMany({ where: { userId, newsId } });
    // Add karma points for upvoting
    await updateUserKarma(news.userId, KARMA_POINTS.RECEIVE_NEWS_UPVOTE);
    return { success: true, userVote: 'upvote' };
  }
}


async function handleDownvote(userId: string, newsId: string) {
  const existing = await db.newsDownvote.findFirst({ where: { userId, newsId } });
  const news = await db.news.findUnique({
    where: { id: newsId },
    select: { userId: true }
  });

  if (!news) {
    throw new Error('News not found');
  }

  if (existing) {
    await db.newsDownvote.delete({ where: { id: existing.id } });
    // Remove karma points when removing downvote
    await updateUserKarma(news.userId, -KARMA_POINTS.RECEIVE_NEWS_DOWNVOTE);
    return { success: true, userVote: null };
  } else {
    await db.newsDownvote.create({ data: { userId, newsId } });
    await db.newsUpvote.deleteMany({ where: { userId, newsId } });
    // Add karma points for downvoting
    await updateUserKarma(news.userId, KARMA_POINTS.RECEIVE_NEWS_DOWNVOTE);
    return { success: true, userVote: 'downvote' };
  }
}


export async function commentVoteAction(commentId: string, voteType: 'upvote' | 'downvote') {
  try {
    const { userId } = await decodedAuthToken() as any;

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { karma: true }
    });

    if (voteType === 'downvote' && (user?.karma || 0) < 500) {
      return { success: false, error: 'You need at least 500 karma to downvote' };
    }

    if (voteType === 'upvote') {
      return await handleCommentUpvote(userId, commentId);
    } else {
      return await handleCommentDownvote(userId, commentId);
    }
  } catch (error) {
    console.error('Comment vote action error:', error);
    return { success: false, error: 'Voting failed' };
  }
}


async function handleCommentUpvote(userId: string, commentId: string) {
  const existing = await db.commentUpvote.findFirst({ where: { userId, commentId } });
  const comment = await db.comment.findUnique({
    where: { id: commentId },
    select: { userId: true }
  });

  if (!comment) {
    throw new Error('Comment not found');
  }

  if (existing) {
    await db.commentUpvote.delete({ where: { id: existing.id } });
    // Remove karma points when removing upvote
    await updateUserKarma(comment.userId, -KARMA_POINTS.RECEIVE_COMMENT_UPVOTE);
    return { success: true, userVote: null };
  } else {
    await db.commentUpvote.create({ data: { userId, commentId } });
    await db.commentDownvote.deleteMany({ where: { userId, commentId } });
    // Add karma points for upvoting
    await updateUserKarma(comment.userId, KARMA_POINTS.RECEIVE_COMMENT_UPVOTE);
    return { success: true, userVote: 'upvote' };
  }
}


async function handleCommentDownvote(userId: string, commentId: string) {
  const existing = await db.commentDownvote.findFirst({ where: { userId, commentId } });
  const comment = await db.comment.findUnique({
    where: { id: commentId },
    select: { userId: true }
  });

  if (!comment) {
    throw new Error('Comment not found');
  }

  if (existing) {
    await db.commentDownvote.delete({ where: { id: existing.id } });
    // Remove karma points when removing downvote
    await updateUserKarma(comment.userId, -KARMA_POINTS.RECEIVE_COMMENT_DOWNVOTE);
    return { success: true, userVote: null };
  } else {
    await db.commentDownvote.create({ data: { userId, commentId } });
    await db.commentUpvote.deleteMany({ where: { userId, commentId } });
    // Add karma points for downvoting
    await updateUserKarma(comment.userId, KARMA_POINTS.RECEIVE_COMMENT_DOWNVOTE);
    return { success: true, userVote: 'downvote' };
  }
}