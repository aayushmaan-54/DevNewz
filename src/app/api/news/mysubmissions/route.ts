import { NextResponse } from 'next/server';
import { db } from '@/common/lib/db';
import { validateUserAuth } from '@/common/utils/auth';


export async function GET() {
  try {
    const { userId, errorResponse } = await validateUserAuth();

    if (errorResponse) return errorResponse;

    const news = await db.news.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { username: true } },
        upvotes: true,
        downvotes: true,
      },
    });


    const formatted = news.map(news => ({
      id: news.id,
      title: news.title,
      url: news.url,
      createdAt: news.createdAt,
      username: news.user.username,
      upvotes: news.upvotes.length,
      downvotes: news.downvotes.length,
    }));


    return NextResponse.json({
      success: true,
      message: "Fetched submission news successfully!",
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