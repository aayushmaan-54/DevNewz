import {
  commentVoteAction,
  voteAction
} from '@/app/news/actions/vote-action';
import { NextResponse } from 'next/server';


export async function POST(request: Request) {
  try {
    const { newsId, commentId, voteType } = await request.json();

    if (commentId) {
      const result = await commentVoteAction(commentId, voteType);
      return NextResponse.json({
        success: result.success,
        message: result.success ? "Comment Voted Successfully!" : "Failed to vote on comment",
        data: {
          userVote: result
        }
      });
    } else {
      const result = await voteAction(newsId, voteType);
      return NextResponse.json({
        success: result.success,
        message: result.success ? "News Voted Successfully!" : result.error || "Failed to vote on news",
        data: {
          userVote: result.data?.userVote
        }
      });
    }
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({
        success: false,
        message: error.message,
        data: null
      }, { status: 401 });
    }
    return NextResponse.json({
      success: false,
      message: 'Unknown error occurred',
      data: null
    }, { status: 500 });
  }
}