import { NextResponse } from 'next/server';
import { db } from '@/common/lib/db';
import { validateUserAuth } from '@/common/utils/auth';


export async function GET() {
  try {
    const { userId, errorResponse } = await validateUserAuth();

    if (errorResponse) return errorResponse;


    const upvotes = await db.commentUpvote.findMany({
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


    const formatted = upvotes.map(upvote => ({
      id: upvote.comment.id,
      content: upvote.comment.content,
      createdAt: upvote.comment.createdAt,
      username: upvote.comment.user.username,
      upvotes: upvote.comment.upvotes.length,
      downvotes: upvote.comment.downvotes.length,
      newsId: upvote.comment.news.id,
      newsTitle: upvote.comment.news.title,
    }));

    return NextResponse.json({
      success: true,
      message: "Fetched upvoted comments successfully!",
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