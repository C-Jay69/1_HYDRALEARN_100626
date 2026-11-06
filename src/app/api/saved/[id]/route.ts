import { NextResponse } from 'next/server';

import {
  deleteSavedContent,
  getSavedContent,
} from '@/lib/saved-content';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const item = await getSavedContent(id);
    if (!item) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ item });
  } catch (error) {
    console.error('[api/saved/:id] Failed to load item:', error);
    return NextResponse.json(
      { error: 'Could not load this item.' },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const result = await deleteSavedContent(id);
    if (!result.ok) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error('[api/saved/:id] Failed to delete item:', error);
    return NextResponse.json(
      { error: 'Could not delete this item.' },
      { status: 500 }
    );
  }
}
