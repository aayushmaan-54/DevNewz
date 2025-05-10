import { NextResponse } from 'next/server';
import { db } from '@/common/lib/db';
import { validateUserAuth } from '@/common/utils/auth';


export async function GET() {
  try {
    const { userId, errorResponse } = await validateUserAuth();
    if (errorResponse) return errorResponse;

    const downvotes = await db.commentDownvote.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        comment: {
          include: {
            user: { select: { username: true } },
            upvotes: true,
            downvotes: true,
            news: { select: { id: true, title: true } },
          },
        },
      },
    });

    const formatted = downvotes.map(downvote => ({
      id: downvote.comment.id,
      content: downvote.comment.content,
      createdAt: downvote.comment.createdAt,
      username: downvote.comment.user.username,
      upvotes: downvote.comment.upvotes.length,
      downvotes: downvote.comment.downvotes.length,
      newsId: downvote.comment.news.id,
      newsTitle: downvote.comment.news.title,
    }));

    return NextResponse.json({
      success: true,
      message: "Fetched downvoted comments successfully!",
      data: formatted
    });
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