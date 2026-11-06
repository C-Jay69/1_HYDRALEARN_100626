'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/components/i18n-provider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const formSchema = z.object({
  subject: z.string().min(2, 'Subject is required.'),
  topic: z.string().min(2, 'Topic is required.'),
  gradeLevel: z.string().min(1, 'Grade level is required.'),
  assessmentType: z.enum(['quiz', 'game', 'project', 'essay', 'jeopardy', 'millionaire', 'family-feud', 'countdown', 'weakest-link', 'puzzles', 'escape-room']),
  learningObjectives: z.string().min(10, 'Please provide detailed learning objectives.'),
  curriculum: z.string().min(2, 'Curriculum is required.'),
});

type FormData = z.infer<typeof formSchema>;

interface SaveFeedback {
  ok: boolean;
  message?: string;
}

interface AssessmentResponse {
  assessmentContent: string;
  feedback?: string;
  quiz?: unknown[];
  saved?: SaveFeedback;
}

export function AssessmentGeneratorForm() {
  const [result, setResult] = useState<AssessmentResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t, locale } = useI18n();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: 'American History',
      topic: 'The American Revolution',
      gradeLevel: '8th Grade',
      assessmentType: 'quiz',
      learningObjectives: 'Students will be able to identify key figures, events, and their significance.',
      curriculum: 'Common Core',
    },
  });

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await fetch('/api/create-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, tone: 'Academic', locale }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to generate assessment');
      }

      const assessment: AssessmentResponse = await response.json();
      setResult(assessment);

      if (assessment.saved && !assessment.saved.ok) {
        toast({
          variant: 'destructive',
          title: t('library.quotaTitle'),
          description: assessment.saved.message ?? t('library.saveFailed'),
        });
      } else if (assessment.saved?.ok) {
        toast({ title: t('common.savedToLibrary') });
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: t('common.errorTitle'),
        description: t('assessment.error'),
      });
    } finally {
      setIsLoading(false);
    }
  }

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
                  <Input placeholder={t('studio.subjectPlaceholder')} {...field} />
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
                <FormLabel>{t('common.topic')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('studio.topicPlaceholder')} {...field} />
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
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="assessmentType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('assessment.type')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('assessment.typePlaceholder')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="quiz">{t('assessment.quiz')}</SelectItem>
                    <SelectItem value="game">{t('assessment.game')}</SelectItem>
                    <SelectItem value="project">{t('assessment.project')}</SelectItem>
                    <SelectItem value="essay">{t('assessment.essay')}</SelectItem>
                    <SelectItem value="jeopardy">{t('assessment.jeopardy')}</SelectItem>
                    <SelectItem value="millionaire">{t('assessment.millionaire')}</SelectItem>
                    <SelectItem value="family-feud">{t('assessment.familyFeud')}</SelectItem>
                    <SelectItem value="countdown">{t('assessment.countdown')}</SelectItem>
                    <SelectItem value="weakest-link">{t('assessment.weakestLink')}</SelectItem>
                    <SelectItem value="puzzles">{t('assessment.puzzles')}</SelectItem>
                    <SelectItem value="escape-room">{t('assessment.escapeRoom')}</SelectItem>
                  </SelectContent>
                </Select>
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
                  <Input placeholder={t('assessment.curriculumPlaceholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="learningObjectives"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('assessment.objectives')}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t('assessment.objectivesPlaceholder')}
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
                {t('assessment.creating')}
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                {t('assessment.create')}
              </>
            )}
          </Button>
        </form>
      </Form>

      <div className="space-y-4">
        <h3 className="font-headline text-2xl font-bold">{t('assessment.generated')}</h3>
        <div className="min-h-[400px]">
          {isLoading && (
            <Card className="h-full flex items-center justify-center border-dashed">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p>{t('assessment.building')}</p>
              </div>
            </Card>
          )}
          {!isLoading && !result && (
            <Card className="h-full flex items-center justify-center border-dashed">
              <div className="text-center text-muted-foreground">
                <p>{t('assessment.empty')}</p>
              </div>
            </Card>
          )}
          {result && (
            <Tabs defaultValue="content" className="w-full">
              <TabsList>
                <TabsTrigger value="content">{t('assessment.contentTab')}</TabsTrigger>
                <TabsTrigger value="feedback">{t('assessment.feedbackTab')}</TabsTrigger>
              </TabsList>
              <TabsContent value="content">
                <Card>
                  <CardContent className="p-6">
                    <pre className="whitespace-pre-wrap font-body text-sm">{result.assessmentContent}</pre>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="feedback">
                <Card>
                  <CardContent className="p-6">
                    <pre className="whitespace-pre-wrap font-body text-sm">{result.feedback}</pre>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
}
