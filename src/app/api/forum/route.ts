import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { moderateContent } from '@/ai/flows/forum-moderator';

export async function GET() {
  try {
    const posts = await db.forumPost.findMany({
      where: { parentId: null },
      include: {
        author: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching forum threads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch forum threads' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, parentId } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // For now, use a placeholder user ID (auth not yet integrated)
    const userId = 'placeholder-user';

    // Run AI moderation before saving
    const moderation = await moderateContent(content);

    if (moderation.suggestedAction === 'BLOCK') {
      return NextResponse.json(
        { error: `Content blocked for: ${moderation.flagReason || 'Safety violation'}` },
        { status: 403 }
      );
    }

    const post = await db.forumPost.create({
      data: {
        authorId: userId,
        content,
        parentId: parentId || null,
        isFlagged: moderation.suggestedAction === 'FLAG_FOR_REVIEW',
      },
      include: {
        author: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error: any) {
    console.error('Error creating forum post:', error);
    return NextResponse.json(
      { error: 'Failed to create post', details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
