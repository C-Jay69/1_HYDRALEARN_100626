'use client';

import { useEffect, useState } from 'react';
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
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Brush } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/components/i18n-provider';
import { useSearchParams } from 'next/navigation';

interface SaveFeedback {
  ok: boolean;
  message?: string;
}

interface GenerateLearningMaterialResponse {
  content: string;
  saved?: SaveFeedback;
}

const formSchema = z.object({
  materialType: z.string().min(3, 'Please describe material type.'),
  subject: z.string().min(2, 'Subject is required.'),
  topic: z.string().min(3, 'A topic is required.'),
  gradeLevel: z.string().min(1, 'Grade level is required.'),
  instructions: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function StudioForm() {
  const [result, setResult] = useState<GenerateLearningMaterialResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t, locale } = useI18n();
  const searchParams = useSearchParams();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      materialType: searchParams.get('materialType') || 'Flashcards',
      subject: searchParams.get('subject') || 'Science',
      topic: searchParams.get('topic') || 'The Water Cycle',
      gradeLevel: searchParams.get('gradeLevel') || '4th Grade',
      instructions: searchParams.get('instructions') || 'Create 10 flashcards. One side should have a term, other side a simple definition.',
    },
  });

  useEffect(() => {
    form.reset({
      materialType: searchParams.get('materialType') || '',
      subject: searchParams.get('subject') || '',
      topic: searchParams.get('topic') || '',
      gradeLevel: searchParams.get('gradeLevel') || '',
      instructions: searchParams.get('instructions') || '',
    });
  }, [searchParams, form]);

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await fetch('/api/generate-material', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...data, locale }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate material');
      }

      const materialData: GenerateLearningMaterialResponse = await response.json();
      setResult(materialData);

      if (materialData.saved && !materialData.saved.ok) {
        toast({
          variant: 'destructive',
          title: t('library.quotaTitle'),
          description: materialData.saved.message ?? t('library.saveFailed'),
        });
      } else if (materialData.saved?.ok) {
        toast({ title: t('common.savedToLibrary') });
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: t('common.errorTitle'),
        description: t('studio.error'),
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
            name="materialType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('studio.materialType')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('studio.materialTypePlaceholder')} {...field} />
                </FormControl>
                <FormDescription>
                  {t('studio.materialTypeHelp')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('common.subject')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('studio.subjectPlaceholder')} {...field} />
                </FormControl>
                <FormDescription>
                  {t('studio.subjectHelp')}
                </FormDescription>
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
            name="instructions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('studio.instructions')}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t('studio.instructionsPlaceholder')}
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
                {t('studio.creating')}
              </>
            ) : (
              <>
                <Brush className="mr-2 h-4 w-4" />
                {t('studio.generate')}
              </>
            )}
          </Button>
        </form>
      </Form>

      <div className="space-y-4">
        <h3 className="font-headline text-2xl font-bold">{t('studio.generated')}</h3>
        <div className="min-h-[400px]">
          {isLoading && (
            <Card className="h-full flex items-center justify-center border-dashed">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p>{t('studio.creatingMaterial')}</p>
              </div>
            </Card>
          )}
          {!isLoading && !result && (
            <Card className="h-full flex items-center justify-center border-dashed">
              <div className="text-center text-muted-foreground">
                <p>{t('studio.empty')}</p>
              </div>
            </Card>
          )}
          {result && (
            <Card>
              <CardContent className="p-6">
                <pre className="whitespace-pre-wrap font-body text-sm">{result.content}</pre>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
