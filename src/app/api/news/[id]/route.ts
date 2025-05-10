import { NextResponse } from 'next/server';
import { db } from '@/common/lib/db';
import { validateUserAuth } from '@/common/utils/auth';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, errorResponse } = await validateUserAuth();

    if (errorResponse) return errorResponse;

    const paramsData = await params;
    const newsId = paramsData.id;

    const news = await db.news.findUnique({
      where: { id: newsId },
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
    });

    if (!news) {
      return NextResponse.json({ 
          success: false,
          message: 'News not found',
          data: null
        },
        { status: 404 }
      );
    }

    const userUpvote = await db.newsUpvote.findFirst({
      where: { userId, newsId }
    });

    const userDownvote = await db.newsDownvote.findFirst({
      where: { userId, newsId }
    });

    let userVote: 'upvote' | 'downvote' | null = null;
    if (userUpvote) userVote = 'upvote';
    if (userDownvote) userVote = 'downvote';

    const formattedNews = {
      id: news.id,
      title: news.title,
      url: news.url,
      content: news.content,
      createdAt: news.createdAt,
      upvotes: news.upvotes.length,
      downvotes: news.downvotes.length,
      username: news.user.username,
      commentCount: news.comments.length,
      userKarma: news.user.karma,
      userVote
    };

    return NextResponse.json({
      success: true,
      message: "Fetched news successfully!",
      data: formattedNews
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, errorResponse } = await validateUserAuth();

    if (errorResponse) return errorResponse;

    const paramsData = await params;
    const newsId = paramsData.id;
    const body = await request.json();
    const { title, url, content } = body;

    // Check if the news exists and belongs to the user
    const news = await db.news.findUnique({
      where: { id: newsId },
      select: { userId: true }
    });

    if (!news) {
      return NextResponse.json({
        success: false,
        message: 'News not found',
        data: null
      }, { status: 404 });
    }

    if (news.userId !== userId) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized to edit this news',
        data: null
      }, { status: 403 });
    }

    // Update the news
    const updatedNews = await db.news.update({
      where: { id: newsId },
      data: {
        title,
        url,
        content,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'News updated successfully',
      data: updatedNews
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

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, errorResponse } = await validateUserAuth();

    if (errorResponse) return errorResponse;

    const paramsData = await params;
    const newsId = paramsData.id;

    // Check if the news exists and belongs to the user
    const news = await db.news.findUnique({
      where: { id: newsId },
      select: { userId: true }
    });

    if (!news) {
      return NextResponse.json({
        success: false,
        message: 'News not found',
        data: null
      }, { status: 404 });
    }

    if (news.userId !== userId) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized to delete this news',
        data: null
      }, { status: 403 });
    }

    // Delete the news
    await db.news.delete({
      where: { id: newsId }
    });

    return NextResponse.json({
      success: true,
      message: 'News deleted successfully',
      data: null
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