'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/components/i18n-provider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  essay: z.string().min(50, 'Essay content is too short.'),
  gradeLevel: z.string().min(1, 'Grade level is required.'),
  rubric: z.string().min(20, 'Rubric must be provided.'),
  teacherNotes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface SaveFeedback {
  ok: boolean;
  message?: string;
}

interface EssayGradeResponse {
  grade: string;
  feedback: string;
  reasoning: string;
  saved?: SaveFeedback;
}

export function EssayGraderForm() {
  const [result, setResult] = useState<EssayGradeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t, locale } = useI18n();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      essay: 'The primary cause of the Civil War was the issue of slavery. Southern states depended on enslaved labor for their economy, while Northern states were increasingly abolitionist. This fundamental disagreement created deep political and social divides that ultimately led to conflict.',
      gradeLevel: '8th Grade',
      rubric: 'A: Excellent - Clear thesis, strong evidence, well-structured. B: Good - Clear thesis, some evidence, minor structure issues. C: Fair - Unclear thesis, weak evidence. D: Poor - Lacks thesis and evidence.',
      teacherNotes: 'Focus on the use of specific historical evidence.',
    },
  });

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    setResult(null);
    try {
      // Fetch the style guide from localStorage
      const styleGuide = localStorage.getItem('teacherStyleGuide');

      const response = await fetch('/api/grade-essay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, styleGuide: styleGuide ?? undefined, locale }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to grade essay');
      }

      const grade: EssayGradeResponse = await response.json();
      setResult(grade);

      if (grade.saved && !grade.saved.ok) {
        toast({
          variant: 'destructive',
          title: t('library.quotaTitle'),
          description: grade.saved.message ?? t('library.saveFailed'),
        });
      } else if (grade.saved?.ok) {
        toast({ title: t('common.savedToLibrary') });
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: t('common.errorTitle'),
        description: t('essay.error'),
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="essay"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('essay.studentEssay')}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t('essay.essayPlaceholder')}
                    className="min-h-[200px] font-mono text-xs"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gradeLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('common.gradeLevel')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('studio.gradePlaceholder')} {...field} />
                </FormControl>
                <FormDescription>
                  {t('essay.gradeHelp')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rubric"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('essay.rubric')}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t('essay.rubricPlaceholder')}
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="teacherNotes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('essay.teacherNotes')}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t('essay.teacherNotesPlaceholder')}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  {t('essay.teacherNotesHelp')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('essay.grading')}
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                {t('essay.grade')}
              </>
            )}
          </Button>
        </form>
      </Form>

      <div className="space-y-4">
        <h3 className="font-headline text-2xl font-bold">{t('essay.results')}</h3>
        <div className="min-h-[400px]">
          {isLoading && (
            <Card className="h-full flex items-center justify-center border-dashed">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p>{t('essay.reading')}</p>
              </div>
            </Card>
          )}
          {!isLoading && !result && (
            <Card className="h-full flex items-center justify-center border-dashed">
              <div className="text-center text-muted-foreground">
                <p>{t('essay.empty')}</p>
              </div>
            </Card>
          )}
          {result && (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle>{t('essay.resultTitle')}</CardTitle>
                  <Badge variant="secondary" className="text-lg">
                    {t('essay.gradeLabel', { grade: result.grade })}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold text-base mb-2">{t('essay.studentFeedback')}</h4>
                  <p className="text-sm text-muted-foreground">{result.feedback}</p>
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold text-base mb-2">{t('essay.reasoning')}</h4>
                  <p className="text-sm text-muted-foreground">{result.reasoning}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
