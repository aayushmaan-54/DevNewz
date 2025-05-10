/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { db } from '@/common/lib/db';
import { decodedAuthToken } from '@/common/utils/auth';
import { startOfDay, endOfDay, parse } from 'date-fns';


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date');

    if (!dateStr) {
      return NextResponse.json({
        success: false,
        message: 'Date parameter is required',
        data: null
      }, { status: 400 });
    }

    const parsedDate = parse(dateStr, 'dd/MM/yyyy', new Date());

    const startDate = startOfDay(parsedDate);
    const endDate = endOfDay(parsedDate);

    const { userId } = await decodedAuthToken() as any;

    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '30');
    const skip = (page - 1) * pageSize;

    const totalNews = await db.news.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const news = await db.news.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
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
      message: "Fetched past news successfully!",
      data: formattedNews,
      pagination: {
        currentPage: page,
        pageSize,
        totalNews,
        totalPages: Math.ceil(totalNews / pageSize),
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