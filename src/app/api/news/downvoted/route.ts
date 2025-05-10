import { NextResponse } from 'next/server';
import { db } from '@/common/lib/db';
import { validateUserAuth } from '@/common/utils/auth';


export async function GET() {
  try {
    const { userId, errorResponse } = await validateUserAuth();

    if (errorResponse) return errorResponse;

    const downvotes = await db.newsDownvote.findMany({
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


    const formatted = downvotes.map(downvote => ({
      id: downvote.news.id,
      title: downvote.news.title,
      url: downvote.news.url,
      createdAt: downvote.news.createdAt,
      username: downvote.news.user.username,
      upvotes: downvote.news.upvotes.length,
      downvotes: downvote.news.downvotes.length,
    }));


    return NextResponse.json({
      success: true,
      message: "Fetched downvoted news successfully!",
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