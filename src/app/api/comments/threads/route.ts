/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { db } from '@/common/lib/db';
import { validateUserAuth } from '@/common/utils/auth';


export async function GET() {
  try {
    const { userId, errorResponse } = await validateUserAuth();

    if (errorResponse) return errorResponse;

    const comments = await db.comment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { username: true } },
        upvotes: true,
        downvotes: true,
        news: { select: { id: true, title: true } },
      },
    });

    const formatted = comments.map(comment => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      username: comment.user.username,
      upvotes: comment.upvotes.length,
      downvotes: comment.downvotes.length,
      newsId: comment.news.id,
      newsTitle: comment.news.title,
      parentCommentId: comment.parentCommentId,
      depth: comment.depth,
    }));

    // Build nested comment tree
    function buildCommentTree(comments: any[]): any[] {
      const map: Record<string, any> = {};
      const roots: any[] = [];
      comments.forEach((comment: any) => {
        map[comment.id] = { ...comment, children: [] };
      });
      comments.forEach((comment: any) => {
        if (comment.parentCommentId && map[comment.parentCommentId]) {
          map[comment.parentCommentId].children.push(map[comment.id]);
        } else {
          roots.push(map[comment.id]);
        }
      });
      return roots;
    }

    const threaded = buildCommentTree(formatted);

    return NextResponse.json({
      success: true,
      message: "Fetched user threads successfully!",
      data: threaded
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