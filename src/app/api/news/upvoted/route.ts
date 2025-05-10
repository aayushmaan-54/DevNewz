import { NextResponse } from 'next/server';
import { db } from '@/common/lib/db';
import { validateUserAuth } from '@/common/utils/auth';


export async function GET() {
  try {
    const { userId, errorResponse } = await validateUserAuth();

    if (errorResponse) return errorResponse;

    const upvotes = await db.newsUpvote.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        news: {
          include: {
            user: { select: { username: true } },
            upvotes: true,
            downvotes: true,
          },
        },
      },
    });

    const formatted = upvotes.map(upvote => ({
      id: upvote.news.id,
      title: upvote.news.title,
      url: upvote.news.url,
      createdAt: upvote.news.createdAt,
      username: upvote.news.user.username,
      upvotes: upvote.news.upvotes.length,
      downvotes: upvote.news.downvotes.length,
    }));

    return NextResponse.json({
      success: true,
      message: "Fetched upvoted news successfully!",
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