import { NextResponse } from 'next/server';
import { db } from '@/common/lib/db';
import { validateUserAuth } from '@/common/utils/auth';


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = 30;
    const skip = (page - 1) * pageSize;

    const { userId, errorResponse } = await validateUserAuth();

    if (errorResponse) return errorResponse;

    const totalNews = await db.news.count();

    const news = await db.news.findMany({
      include: {
        user: {
          select: {
            username: true,
            karma: true,
          },
        },
        upvotes: true,
        downvotes: true,
        comments: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: pageSize,
    });


    const formattedNews = await Promise.all(news.map(async news => {
      const userUpvote = await db.newsUpvote.findFirst({
        where: { userId, newsId: news.id }
      });
      const userDownvote = await db.newsDownvote.findFirst({
        where: { userId, newsId: news.id }
      });

      let userVote: 'upvote' | 'downvote' | null = null;
      if (userUpvote) userVote = 'upvote';
      if (userDownvote) userVote = 'downvote';

      return {
        id: news.id,
        title: news.title,
        url: news.url,
        createdAt: news.createdAt,
        upvotes: news.upvotes.length,
        downvotes: news.downvotes.length,
        username: news.user.username,
        commentCount: news.comments.length,
        userKarma: news.user.karma,
        userVote
      };
    }));

    
    return NextResponse.json({
      success: true,
      message: 'Fetched news successfully!',
      data: formattedNews,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalNews / pageSize),
        totalNews,
        pageSize
      }
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