/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { db } from '@/common/lib/db';
import { validateUserAuth } from '@/common/utils/auth';



type CommentNode = any;
function buildCommentTree(
  comments: any[],
  parentId: string | null = null,
  depth = 0
): CommentNode[] {
  if (depth >= 5) return [];
  return comments
    .filter(c => c.parentCommentId === parentId)
    .map(c => ({
      ...c,
      children: buildCommentTree(comments, c.id, depth + 1),
    }));
}




export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const paramsData = await params;
    const newsId = paramsData.id;

    const { userId, errorResponse } = await validateUserAuth();

    if (errorResponse) return errorResponse;


    const comments = await db.comment.findMany({
      where: { newsId },
      include: {
        user: { select: { username: true } },
        upvotes: true,
        downvotes: true,
      },
      orderBy: { createdAt: 'asc' },
    });


    const formatted = await Promise.all(comments.map(async comment => {
      let userVote: 'upvote' | 'downvote' | null = null;
      if (userId) {
        if (comment.upvotes.some(upvote => upvote.userId === userId)) userVote = 'upvote';
        if (comment.downvotes.some(downvote => downvote.userId === userId)) userVote = 'downvote';
      }
      return {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        username: comment.user.username,
        upvotes: comment.upvotes.length,
        downvotes: comment.downvotes.length,
        parentCommentId: comment.parentCommentId,
        depth: comment.depth,
        userVote,
      };
    }));

    const tree = buildCommentTree(formatted);

    return NextResponse.json({
      success: true,
      message: "Fetched comments successfully!",
      data: tree
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




export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, errorResponse } = await validateUserAuth();

    if (errorResponse) return errorResponse;


    const paramsData = await params;
    const newsId = paramsData.id;

    const { content, parentCommentId } = await request.json();

    let depth = 0;
    if (parentCommentId) {
      const parent = await db.comment.findUnique({ where: { id: parentCommentId } });
      if (!parent) return NextResponse.json({
        success: false,
        message: "Parent comment not found",
        data: null
      }, { status: 400 });
      depth = parent.depth + 1;
      if (depth >= 5) return NextResponse.json({
        success: false,
        message: 'Max depth reached',
        data: null
      }, { status: 400 });
    }

    const comment = await db.comment.create({
      data: {
        content,
        userId,
        newsId,
        parentCommentId: parentCommentId || null,
        depth,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Comment Added Successfully",
      data: comment
    }, { status: 201 });
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
  request: Request,
) {
  try {
    const { userId, errorResponse } = await validateUserAuth();

    if (errorResponse) return errorResponse;


    const { commentId } = await request.json();
    const comment = await db.comment.findUnique({
      where: { id: commentId }
    });

    if (!comment) return NextResponse.json({
      success: false,
      message: 'Comment not found',
      data: null
    }, { status: 404 });
    if (comment.userId !== userId) return NextResponse.json({
      success: false,
      message: 'Unauthorized',
      data: null
    }, { status: 403 });


    async function deleteCommentAndChildren(id: string) {
      const children = await db.comment.findMany({
        where: { parentCommentId: id }
      });

      for (const child of children) {
        await deleteCommentAndChildren(child.id);
      }

      await db.comment.delete({ where: { id } });
    }


    await deleteCommentAndChildren(commentId);

    return NextResponse.json({
      success: true,
      message: "Comment deleted successfully with its children",
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




export async function PATCH(request: Request) {
  try {
    const { userId, errorResponse } = await validateUserAuth();

    if (errorResponse) return errorResponse;

    const { commentId, content } = await request.json();
    const comment = await db.comment.findUnique({
      where: { id: commentId }
    });

    if (!comment) return NextResponse.json({
      success: false,
      message: 'Comment not found',
      data: null
    }, { status: 404 });

    if (comment.userId !== userId) return NextResponse.json({
      success: false,
      message: 'Unauthorized',
      data: null
    }, { status: 403 });

    const updated = await db.comment.update({
      where: { id: commentId },
      data: { content }
    });

    return NextResponse.json({
      success: true,
      message: "Comment patched successfully",
      data: updated
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