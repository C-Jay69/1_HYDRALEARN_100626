'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Eye, Loader2, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/components/i18n-provider';
import type { MessageKey } from '@/lib/i18n';
import { formatBytes } from '@/lib/format';

interface Usage {
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

interface SavedItem {
  id: string;
  kind: string;
  title: string;
  preview: string;
  sizeBytes: number;
  createdAt: string;
}

interface SavedItemDetail extends SavedItem {
  content: string;
}

const kindLabels: Record<string, MessageKey> = {
  LESSON_PLAN: 'library.kind.lessonPlan',
  ASSESSMENT: 'library.kind.assessment',
  LEARNING_MATERIAL: 'library.kind.material',
  DIFFERENTIATED_ACTIVITIES: 'library.kind.activities',
  ESSAY_GRADE: 'library.kind.essayGrade',
  BATCH_ESSAY_GRADE: 'library.kind.batchEssayGrade',
};

const filters: { value: string; labelKey: MessageKey }[] = [
  { value: 'all', labelKey: 'library.all' },
  { value: 'LESSON_PLAN', labelKey: 'library.kind.lessonPlan' },
  { value: 'ASSESSMENT', labelKey: 'library.kind.assessment' },
  { value: 'LEARNING_MATERIAL', labelKey: 'library.kind.material' },
  { value: 'DIFFERENTIATED_ACTIVITIES', labelKey: 'library.kind.activities' },
  { value: 'ESSAY_GRADE', labelKey: 'library.kind.essayGrade' },
  { value: 'BATCH_ESSAY_GRADE', labelKey: 'library.kind.batchEssayGrade' },
];

export function LibraryClient() {
  const { t, locale } = useI18n();
  const { toast } = useToast();

  const [filter, setFilter] = useState('all');
  const [items, setItems] = useState<SavedItem[]>([]);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewing, setViewing] = useState<SavedItemDetail | null>(null);
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<SavedItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = useCallback(
    async (kind: string) => {
      setIsLoading(true);
      try {
        const query = kind === 'all' ? '' : `?kind=${encodeURIComponent(kind)}`;
        const response = await fetch(`/api/saved${query}`, { cache: 'no-store' });
        if (!response.ok) throw new Error('Failed to load library');
        const data = await response.json();
        setItems(data.items ?? []);
        setUsage(data.usage ?? null);
      } catch (error) {
        console.error(error);
        toast({
          variant: 'destructive',
          title: t('common.errorTitle'),
          description: t('library.loadFailed'),
        });
      } finally {
        setIsLoading(false);
      }
    },
    [t, toast]
  );

  useEffect(() => {
    void load(filter);
  }, [filter, load]);

  async function openItem(item: SavedItem) {
    setIsViewLoading(true);
    try {
      const response = await fetch(`/api/saved/${item.id}`, { cache: 'no-store' });
      if (!response.ok) throw new Error('Failed to load item');
      const data = await response.json();
      setViewing(data.item as SavedItemDetail);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: t('common.errorTitle'),
        description: t('library.loadFailed'),
      });
    } finally {
      setIsViewLoading(false);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/saved/${pendingDelete.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete item');
      const data = await response.json();
      if (data.usage) setUsage(data.usage);
      toast({ title: t('library.deleted') });
      setPendingDelete(null);
      await load(filter);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: t('common.errorTitle'),
        description: t('library.deleteFailed'),
      });
    } finally {
      setIsDeleting(false);
    }
  }

  const dateFormatter = new Intl.DateTimeFormat(locale === 'es' ? 'es-ES' : 'en-US', {
    dateStyle: 'medium',
  });

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{t('library.storage')}</CardTitle>
          <CardDescription>{t('library.storageDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {usage ? (
            <>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="font-medium">
                    {t('library.usedOfQuota', {
                      used: formatBytes(usage.usedBytes),
                      quota: formatBytes(usage.userQuotaBytes),
                    })}
                  </span>
                  <span className="text-muted-foreground">
                    {t('library.itemsUsed', {
                      count: usage.itemCount,
                      max: usage.maxItems,
                    })}
                  </span>
                </div>
                <Progress value={usage.percentUsed} />
              </div>
              <p className="text-xs text-muted-foreground">
                {t('library.workspaceUsage', {
                  used: formatBytes(usage.workspaceUsedBytes),
                  budget: formatBytes(usage.workspaceBudgetBytes),
                })}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
          )}
        </CardContent>
      </Card>

      <Tabs value={filter} onValueChange={setFilter} className="w-full">
        <TabsList className="flex h-auto flex-wrap justify-start gap-1 bg-transparent p-0">
          {filters.map((option) => (
            <TabsTrigger
              key={option.value}
              value={option.value}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {t(option.labelKey)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          {t('common.loading')}
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <p className="text-lg font-medium">{t('library.empty')}</p>
            <p className="max-w-md text-sm text-muted-foreground">
              {t('library.emptyDesc')}
            </p>
            <Button asChild className="mt-2">
              <Link href="/lesson-planner">{t('library.openPlanner')}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id} className="flex flex-col">
              <CardHeader className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="secondary">
                    {kindLabels[item.kind] ? t(kindLabels[item.kind]) : item.kind}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatBytes(item.sizeBytes)}
                  </span>
                </div>
                <CardTitle className="text-base leading-snug break-words">
                  {item.title}
                </CardTitle>
                <CardDescription className="line-clamp-3 whitespace-pre-wrap break-words">
                  {item.preview}
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto flex items-center justify-between gap-2 pt-0">
                <span className="text-xs text-muted-foreground">
                  {t('library.savedOn', {
                    date: dateFormatter.format(new Date(item.createdAt)),
                  })}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openItem(item)}
                    disabled={isViewLoading}
                  >
                    <Eye className="mr-1 h-4 w-4" />
                    {t('common.view')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setPendingDelete(item)}
                    aria-label={t('common.delete')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!viewing} onOpenChange={(open) => !open && setViewing(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="break-words">
              {viewing?.title ?? t('library.viewTitle')}
            </DialogTitle>
            <DialogDescription>
              {viewing
                ? `${kindLabels[viewing.kind] ? t(kindLabels[viewing.kind]) : viewing.kind} · ${dateFormatter.format(new Date(viewing.createdAt))}`
                : null}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto rounded-md border p-4">
            <pre className="whitespace-pre-wrap break-words font-body text-sm">
              {viewing?.content}
            </pre>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t('common.close')}</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('library.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('library.deleteDesc', { title: pendingDelete?.title ?? '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(event) => {
                event.preventDefault();
                void confirmDelete();
              }}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('common.loading')}
                </>
              ) : (
                t('common.delete')
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
