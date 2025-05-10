import { db } from "@/common/lib/db";

export async function updateUserKarma(userId: string, points: number) {
  try {
    await db.user.update({
      where: { id: userId },
      data: {
        karma: {
          increment: points
        }
      }
    });
  } catch (error) {
    console.error('Error updating user karma:', error);
  }
}

export const KARMA_POINTS = {
  NEWS_UPVOTE: 1,
  NEWS_DOWNVOTE: -1,
  COMMENT_UPVOTE: 1,
  COMMENT_DOWNVOTE: -1,
  RECEIVE_NEWS_UPVOTE: 2,
  RECEIVE_NEWS_DOWNVOTE: -2,
  RECEIVE_COMMENT_UPVOTE: 1,
  RECEIVE_COMMENT_DOWNVOTE: -1
}; 