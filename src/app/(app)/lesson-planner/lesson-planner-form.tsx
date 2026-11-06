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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Loader2, Sparkles, Brush } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/components/i18n-provider';
import Link from 'next/link';

const formSchema = z.object({
  studentNeeds: z.string().min(10, 'Please provide more detail on student needs.'),
  curriculum: z.string().min(2, 'Curriculum is required.'),
  objectives: z.string().min(10, 'Please provide more detail on lesson objectives.'),
  gradeLevel: z.string().min(1, 'Grade level is required.'),
  subject: z.string().min(2, 'Subject is required.'),
  topic: z.string().min(1, 'Topic or subtopic is required.'),
});

type FormData = z.infer<typeof formSchema>;

interface SaveFeedback {
  ok: boolean;
  message?: string;
}

interface GenerateLessonPlanResponse {
  lessonPlan: string;
  saved?: SaveFeedback;
}

export function LessonPlannerForm() {
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t, locale } = useI18n();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentNeeds: '',
      curriculum: 'Common Core',
      objectives: '',
      gradeLevel: '5th Grade',
      subject: 'Mathematics',
      topic: '',
    },
  });

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await fetch('/api/generate-lesson-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...data, locale }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const detail = errorData?.details ? `: ${errorData.details}` : '';
        throw new Error(`${errorData?.error || 'Failed to generate lesson plan'}${detail}`);
      }

      const lessonPlanData: GenerateLessonPlanResponse = await response.json();
      setResult(lessonPlanData.lessonPlan);

      if (lessonPlanData.saved && !lessonPlanData.saved.ok) {
        toast({
          variant: 'destructive',
          title: t('library.quotaTitle'),
          description: lessonPlanData.saved.message ?? t('library.saveFailed'),
        });
      } else if (lessonPlanData.saved?.ok) {
        toast({ title: t('common.savedToLibrary') });
      }
    } catch (error) {
      console.error('Error generating lesson plan:', error);
      toast({
        variant: 'destructive',
        title: t('common.errorTitle'),
        description:
          error instanceof Error ? error.message : t('lessonPlanner.error'),
      });
    } finally {
      setIsLoading(false);
    }
  }

  const createStudioLink = () => {
    if (!result) return '';
    const { subject, gradeLevel, topic } = form.getValues();
    const params = new URLSearchParams({
      subject: subject || 'General',
      topic: topic || subject || '',
      gradeLevel,
      instructions: `Based on the following lesson plan, generate the necessary materials (e.g., flashcards, worksheets):\n\n${result}`,
    });
    return `/studio?${params.toString()}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('common.subject')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('lessonPlanner.placeholder.subject')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="topic"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('lessonPlanner.topicOptional')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('lessonPlanner.placeholder.topic')} {...field} />
                </FormControl>
                <FormDescription>
                  {t('lessonPlanner.topicHelp')}
                </FormDescription>
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
                  <Input placeholder={t('lessonPlanner.placeholder.grade')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="curriculum"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('common.curriculum')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('lessonPlanner.placeholder.curriculum')} {...field} />
                </FormControl>
                <FormDescription>
                  {t('lessonPlanner.curriculumHelp')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="studentNeeds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('lessonPlanner.studentNeeds')}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t('lessonPlanner.studentNeedsPlaceholder')}
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
            name="objectives"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('lessonPlanner.objectives')}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t('lessonPlanner.objectivesPlaceholder')}
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('lessonPlanner.generating')}
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                {t('lessonPlanner.generatePlan')}
              </>
            )}
          </Button>
        </form>
      </Form>

      <div className="space-y-4">
        <h3 className="font-headline text-2xl font-bold">{t('lessonPlanner.generatedPlan')}</h3>
        <Card className="min-h-[400px]">
          {isLoading && (
            <div className="flex items-center justify-center h-full border-dashed rounded-lg">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p>{t('lessonPlanner.thinking')}</p>
              </div>
            </div>
          )}
          {!isLoading && !result && (
            <div className="flex items-center justify-center h-full border-dashed rounded-lg">
              <div className="text-center text-muted-foreground">
                <p>{t('lessonPlanner.empty')}</p>
              </div>
            </div>
          )}
          {result && (
            <>
              <CardContent className="p-6 max-h-[60vh] overflow-y-auto">
                <pre className="whitespace-pre-wrap font-body text-sm">{result}</pre>
              </CardContent>
              <CardFooter>
                <Button asChild>
                  <Link href={createStudioLink()}>
                    <Brush className="mr-2 h-4 w-4" />
                    {t('lessonPlanner.generateMaterials')}
                  </Link>
                </Button>
              </CardFooter>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
