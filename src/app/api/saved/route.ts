import { NextResponse } from 'next/server';

import {
  isSavedContentKind,
  listSavedContent,
  saveGeneratedContent,
  type SavedContentKind,
} from '@/lib/saved-content';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** List the current user's saved lesson plans and other generated material. */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const kindParam = url.searchParams.get('kind');
    const limit = Number(url.searchParams.get('limit') ?? 50);
    const offset = Number(url.searchParams.get('offset') ?? 0);

    if (kindParam && !isSavedContentKind(kindParam)) {
      return NextResponse.json(
        { error: `Unknown content kind: ${kindParam}` },
        { status: 400 }
      );
    }

    const result = await listSavedContent({
      kind: kindParam as SavedContentKind | undefined,
      limit: Number.isFinite(limit) ? limit : 50,
      offset: Number.isFinite(offset) ? offset : 0,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[api/saved] Failed to list saved content:', error);
    return NextResponse.json(
      { error: 'Could not load your library.' },
      { status: 500 }
    );
  }
}

/** Save an item manually (the generation routes also save automatically). */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { kind, title, content, metadata, preview } = body ?? {};

    if (!isSavedContentKind(kind)) {
      return NextResponse.json(
        { error: 'A valid content kind is required.' },
        { status: 400 }
      );
    }
    if (typeof content !== 'string' || !content.trim()) {
      return NextResponse.json(
        { error: 'Content is required.' },
        { status: 400 }
      );
    }

    const result = await saveGeneratedContent({
      kind,
      title: typeof title === 'string' && title.trim() ? title : 'Untitled',
      content,
      preview: typeof preview === 'string' ? preview : undefined,
      metadata:
        metadata && typeof metadata === 'object'
          ? (metadata as Record<string, unknown>)
          : undefined,
    });

    if (!result.ok) {
      const status =
        result.code === 'ITEM_TOO_LARGE'
          ? 413
          : result.code === 'USER_QUOTA_EXCEEDED' ||
              result.code === 'WORKSPACE_BUDGET_EXCEEDED' ||
              result.code === 'ITEM_LIMIT_REACHED'
            ? 429
            : 500;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('[api/saved] Failed to save content:', error);
    return NextResponse.json(
      { error: 'Could not save this item.' },
      { status: 500 }
    );
  }
}
