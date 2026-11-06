import type { Prisma } from '@prisma/client';

import { db } from './db';
import { getCurrentUserId } from './current-user';

/** Every kind of generated artifact HydraLearn persists. */
export const SAVED_CONTENT_KINDS = {
  LESSON_PLAN: 'LESSON_PLAN',
  ASSESSMENT: 'ASSESSMENT',
  LEARNING_MATERIAL: 'LEARNING_MATERIAL',
  DIFFERENTIATED_ACTIVITIES: 'DIFFERENTIATED_ACTIVITIES',
  ESSAY_GRADE: 'ESSAY_GRADE',
  BATCH_ESSAY_GRADE: 'BATCH_ESSAY_GRADE',
} as const;

export type SavedContentKind = keyof typeof SAVED_CONTENT_KINDS;

export function isSavedContentKind(value: unknown): value is SavedContentKind {
  return typeof value === 'string' && value in SAVED_CONTENT_KINDS;
}

const MB = 1024 * 1024;

/**
 * Supabase's free tier includes 500 MB of database storage. We keep a reserve
 * for Postgres catalog tables, indexes and future app data, then treat the rest
 * as the workspace budget shared by every user's saved content.
 */
export const SUPABASE_FREE_TIER_BYTES = 500 * MB;
export const SYSTEM_RESERVE_BYTES = 75 * MB;
export const WORKSPACE_BUDGET_BYTES = SUPABASE_FREE_TIER_BYTES - SYSTEM_RESERVE_BYTES;

function envNumber(name: string, fallback: number) {
  const parsed = Number(process.env[name]);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/** Per-user allowance inside the shared free-tier budget. */
export const PER_USER_QUOTA_BYTES = envNumber('SAVED_CONTENT_USER_QUOTA_MB', 50) * MB;
/** Hard cap for a single generated item, so one huge output can't eat a quota. */
export const MAX_ITEM_BYTES = envNumber('SAVED_CONTENT_MAX_ITEM_MB', 5) * MB;
/** Row-count cap keeps tiny rows from bloating table/index overhead. */
export const MAX_ITEMS_PER_USER = envNumber('SAVED_CONTENT_MAX_ITEMS', 500);

export interface StorageUsage {
  usedBytes: number;
  itemCount: number;
  userQuotaBytes: number;
  remainingBytes: number;
  percentUsed: number;
  maxItems: number;
  workspaceUsedBytes: number;
  workspaceBudgetBytes: number;
  workspacePercentUsed: number;
}

export type SaveErrorCode =
  | 'ITEM_TOO_LARGE'
  | 'USER_QUOTA_EXCEEDED'
  | 'WORKSPACE_BUDGET_EXCEEDED'
  | 'ITEM_LIMIT_REACHED'
  | 'SAVE_FAILED';

export interface SaveSummary {
  id: string;
  kind: string;
  title: string;
  sizeBytes: number;
  createdAt: string;
}

export type SaveResult =
  | { ok: true; item: SaveSummary; usage: StorageUsage }
  | { ok: false; code: SaveErrorCode; message: string; usage?: StorageUsage };

export interface SavedContentSummary {
  id: string;
  kind: string;
  title: string;
  preview: string;
  sizeBytes: number;
  createdAt: string;
  metadata: unknown;
}

export interface SavedContentDetail extends SavedContentSummary {
  content: string;
}

function byteLength(value: string | undefined | null) {
  return Buffer.byteLength(value ?? '', 'utf8');
}

function truncate(value: string, max: number) {
  const trimmed = value.trim();
  return trimmed.length <= max ? trimmed : `${trimmed.slice(0, max - 1)}…`;
}

function jsonSize(value: unknown) {
  if (value === undefined || value === null) return 0;
  try {
    return byteLength(JSON.stringify(value));
  } catch {
    return 0;
  }
}

export async function getStorageUsage(userId: string): Promise<StorageUsage> {
  const [userAgg, workspaceAgg] = await Promise.all([
    db.savedContent.aggregate({
      where: { userId },
      _sum: { sizeBytes: true },
      _count: { _all: true },
    }),
    db.savedContent.aggregate({ _sum: { sizeBytes: true } }),
  ]);

  const usedBytes = userAgg._sum.sizeBytes ?? 0;
  const workspaceUsedBytes = workspaceAgg._sum.sizeBytes ?? 0;

  return {
    usedBytes,
    itemCount: userAgg._count._all,
    userQuotaBytes: PER_USER_QUOTA_BYTES,
    remainingBytes: Math.max(PER_USER_QUOTA_BYTES - usedBytes, 0),
    percentUsed: Math.min(
      Math.round((usedBytes / PER_USER_QUOTA_BYTES) * 100),
      100
    ),
    maxItems: MAX_ITEMS_PER_USER,
    workspaceUsedBytes,
    workspaceBudgetBytes: WORKSPACE_BUDGET_BYTES,
    workspacePercentUsed: Math.min(
      Math.round((workspaceUsedBytes / WORKSPACE_BUDGET_BYTES) * 100),
      100
    ),
  };
}

/**
 * Persist a generated artifact for the current user, enforcing per-user and
 * shared free-tier limits. Never throws: generation should still succeed when
 * saving is not possible, so callers can surface `code`/`message` to the user.
 */
export async function saveGeneratedContent(input: {
  kind: SavedContentKind;
  title: string;
  content: string;
  preview?: string;
  metadata?: Record<string, unknown>;
}): Promise<SaveResult> {
  const content = input.content ?? '';
  const title = truncate(input.title || 'Untitled', 160);
  const preview = truncate(input.preview ?? content, 280);
  const sizeBytes =
    byteLength(content) + byteLength(preview) + jsonSize(input.metadata) + byteLength(title);

  let userId: string;
  try {
    userId = await getCurrentUserId();
  } catch (error) {
    console.error('[saved-content] Could not resolve user:', error);
    return {
      ok: false,
      code: 'SAVE_FAILED',
      message: 'Could not identify the current user.',
    };
  }

  let usage: StorageUsage;
  try {
    usage = await getStorageUsage(userId);
  } catch (error) {
    console.error('[saved-content] Could not read storage usage:', error);
    return {
      ok: false,
      code: 'SAVE_FAILED',
      message: 'The library database is unavailable right now.',
    };
  }

  if (sizeBytes > MAX_ITEM_BYTES) {
    return {
      ok: false,
      code: 'ITEM_TOO_LARGE',
      message: `This item is larger than the ${Math.round(
        MAX_ITEM_BYTES / MB
      )} MB single-item limit.`,
      usage,
    };
  }
  if (usage.itemCount >= MAX_ITEMS_PER_USER) {
    return {
      ok: false,
      code: 'ITEM_LIMIT_REACHED',
      message: `You have reached the limit of ${MAX_ITEMS_PER_USER} saved items. Delete some items to make room.`,
      usage,
    };
  }
  if (usage.usedBytes + sizeBytes > PER_USER_QUOTA_BYTES) {
    return {
      ok: false,
      code: 'USER_QUOTA_EXCEEDED',
      message: `Your library has reached its ${Math.round(
        PER_USER_QUOTA_BYTES / MB
      )} MB limit. Delete some items to make room.`,
      usage,
    };
  }
  if (
    usage.workspaceUsedBytes + sizeBytes >
    WORKSPACE_BUDGET_BYTES
  ) {
    return {
      ok: false,
      code: 'WORKSPACE_BUDGET_EXCEEDED',
      message:
        'The shared free-tier storage budget is full. Delete some items to make room.',
      usage,
    };
  }

  try {
    const item = await db.savedContent.create({
      data: {
        userId,
        kind: input.kind,
        title,
        preview,
        content,
        metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
        sizeBytes,
      },
      select: {
        id: true,
        kind: true,
        title: true,
        sizeBytes: true,
        createdAt: true,
      },
    });

    return {
      ok: true,
      item: { ...item, createdAt: item.createdAt.toISOString() },
      usage: {
        ...usage,
        usedBytes: usage.usedBytes + sizeBytes,
        itemCount: usage.itemCount + 1,
        remainingBytes: Math.max(
          PER_USER_QUOTA_BYTES - usage.usedBytes - sizeBytes,
          0
        ),
        percentUsed: Math.min(
          Math.round(((usage.usedBytes + sizeBytes) / PER_USER_QUOTA_BYTES) * 100),
          100
        ),
        workspaceUsedBytes: usage.workspaceUsedBytes + sizeBytes,
        workspacePercentUsed: Math.min(
          Math.round(
            ((usage.workspaceUsedBytes + sizeBytes) / WORKSPACE_BUDGET_BYTES) * 100
          ),
          100
        ),
      },
    };
  } catch (error) {
    console.error('[saved-content] Could not save generated content:', error);
    return {
      ok: false,
      code: 'SAVE_FAILED',
      message: 'The generated content could not be saved to the library.',
      usage,
    };
  }
}

export async function listSavedContent(options: {
  kind?: SavedContentKind;
  limit?: number;
  offset?: number;
} = {}): Promise<{
  items: SavedContentSummary[];
  usage: StorageUsage;
  total: number;
}> {
  const userId = await getCurrentUserId();
  const limit = Math.min(Math.max(options.limit ?? 50, 1), 100);
  const offset = Math.max(options.offset ?? 0, 0);

  const where = {
    userId,
    ...(options.kind ? { kind: options.kind } : {}),
  } satisfies Prisma.SavedContentWhereInput;

  const [rows, total, usage] = await Promise.all([
    db.savedContent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
      select: {
        id: true,
        kind: true,
        title: true,
        preview: true,
        sizeBytes: true,
        createdAt: true,
        metadata: true,
      },
    }),
    db.savedContent.count({ where }),
    getStorageUsage(userId),
  ]);

  return {
    items: rows.map((row) => ({
      ...row,
      createdAt: row.createdAt.toISOString(),
    })),
    usage,
    total,
  };
}

export async function getSavedContent(
  id: string
): Promise<SavedContentDetail | null> {
  const userId = await getCurrentUserId();
  const row = await db.savedContent.findFirst({
    where: { id, userId },
  });
  if (!row) return null;

  return {
    id: row.id,
    kind: row.kind,
    title: row.title,
    preview: row.preview,
    content: row.content,
    metadata: row.metadata,
    sizeBytes: row.sizeBytes,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function deleteSavedContent(
  id: string
): Promise<{ ok: boolean; usage: StorageUsage }> {
  const userId = await getCurrentUserId();
  const result = await db.savedContent.deleteMany({ where: { id, userId } });
  const usage = await getStorageUsage(userId);
  return { ok: result.count > 0, usage };
}

/** Re-exported for server callers; the implementation stays client-safe. */
export { formatBytes } from './format';
