'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Loader2, PlusCircle, Sparkles, Trash2, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/components/i18n-provider';
import { Separator } from '@/components/ui/separator';

const studentProfileSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required.'),
  learningStyle: z.string().min(2, 'Learning style is required.'),
  needs: z.string().min(2, 'Needs are required.'),
  currentLevel: z.string().min(2, 'Current level is required.'),
});

const formSchema = z.object({
  subject: z.string().min(2, 'Subject is required.'),
  topic: z.string().min(2, 'Topic is required.'),
  gradeLevel: z.string().min(1, 'Grade level is required.'),
  students: z.array(studentProfileSchema).min(1, 'At least one student is required.'),
});

type FormData = z.infer<typeof formSchema>;

interface SuggestedActivity {
  studentId: string;
  activityDescription: string;
  justification: string;
}

interface SaveFeedback {
  ok: boolean;
  message?: string;
}

interface ActivitiesResponse {
  activities: SuggestedActivity[];
  saved?: SaveFeedback;
}

export function DifferentiatedActivitiesForm() {
  const [result, setResult] = useState<ActivitiesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t, locale } = useI18n();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: 'Science',
      topic: 'Ecosystems',
      gradeLevel: '4th Grade',
      students: [
        { studentId: 'María', learningStyle: 'Visual', needs: 'Needs visual aids to understand complex systems', currentLevel: 'On track' },
        { studentId: 'Ahmed', learningStyle: 'Kinesthetic', needs: 'Benefits from hands-on activities', currentLevel: 'Advanced' },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'students',
  });

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await fetch('/api/generate-differentiated-activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, tone: 'Academic', locale }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to generate activities');
      }

      const activities: ActivitiesResponse = await response.json();
      setResult(activities);

      if (activities.saved && !activities.saved.ok) {
        toast({
          variant: 'destructive',
          title: t('library.quotaTitle'),
          description: activities.saved.message ?? t('library.saveFailed'),
        });
      } else if (activities.saved?.ok) {
        toast({ title: t('common.savedToLibrary') });
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: t('common.errorTitle'),
        description: t('differentiated.error'),
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('common.subject')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('differentiated.subjectPlaceholder')} {...field} />
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
                    <Input placeholder={t('differentiated.topicPlaceholder')} {...field} />
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
                    <Input placeholder={t('differentiated.gradePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Separator />

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">{t('differentiated.studentProfiles')}</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ studentId: `Student ${fields.length + 1}`, learningStyle: '', needs: '', currentLevel: '' })}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                {t('differentiated.addStudent')}
              </Button>
            </div>
            <div className="space-y-4">
              {fields.map((field, index) => (
                <Card key={field.id}>
                  <CardHeader className="flex flex-row items-center justify-between p-4">
                    <CardTitle className="text-base">
                      {t('differentiated.student', { number: index + 1 })}
                    </CardTitle>
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4 p-4 pt-0">
                    <FormField
                      control={form.control}
                      name={`students.${index}.studentId`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('differentiated.studentName')}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`students.${index}.learningStyle`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('differentiated.learningStyle')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('differentiated.learningStylePlaceholder')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`students.${index}.needs`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('differentiated.needs')}</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`students.${index}.currentLevel`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('differentiated.currentLevel')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('differentiated.currentLevelPlaceholder')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
            {form.formState.errors.students && (
              <p className="text-sm font-medium text-destructive mt-2">{form.formState.errors.students.message}</p>
            )}
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('differentiated.suggesting')}
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                {t('differentiated.getSuggestions')}
              </>
            )}
          </Button>
        </form>
      </Form>

      <div className="space-y-4">
        <h3 className="font-headline text-2xl font-bold">{t('differentiated.suggested')}</h3>
        <div className="min-h-[400px]">
          {isLoading && (
            <Card className="h-full flex items-center justify-center border-dashed">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p>{t('differentiated.finding')}</p>
              </div>
            </Card>
          )}
          {!isLoading && !result && (
            <Card className="h-full flex items-center justify-center border-dashed">
              <div className="text-center text-muted-foreground">
                <p>{t('differentiated.empty')}</p>
              </div>
            </Card>
          )}
          {result && (
            <Accordion type="multiple" className="w-full space-y-4">
              {result.activities.map((activity, index) => (
                <AccordionItem value={`item-${index}`} key={index} className="bg-card border rounded-lg">
                  <AccordionTrigger className="px-6 text-base hover:no-underline">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      {t('differentiated.activityFor', { name: activity.studentId })}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-1">{t('differentiated.descriptionLabel')}</h4>
                        <p className="text-sm text-muted-foreground">{activity.activityDescription}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">{t('differentiated.justification')}</h4>
                        <p className="text-sm text-muted-foreground">{activity.justification}</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </div>
    </div>
  );
}
