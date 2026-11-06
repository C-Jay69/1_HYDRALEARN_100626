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
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/components/i18n-provider';
import { Loader2, Sparkles, FileText, X, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ['text/plain', 'text/markdown'];

const formSchema = z.object({
  styleSamples: z
    .custom<FileList>()
    .refine((files) => files?.length > 0, 'At least one file is required.')
    .refine((files) => Array.from(files).every((file) => file.size <= MAX_FILE_SIZE), `Each file size must be less than 5MB.`)
    .refine((files) => Array.from(files).every((file) => ACCEPTED_FILE_TYPES.includes(file.type)), 'Only .txt and .md files are accepted.'),
});

type FormData = z.infer<typeof formSchema>;

export function PersonalizationForm() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const { toast } = useToast();
  const { t } = useI18n();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      styleSamples: undefined,
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      const allFiles = [...selectedFiles, ...newFiles];
      setSelectedFiles(allFiles);

      const dataTransfer = new DataTransfer();
      allFiles.forEach(file => dataTransfer.items.add(file));
      form.setValue('styleSamples', dataTransfer.files, { shouldValidate: true });
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);

    const dataTransfer = new DataTransfer();
    newFiles.forEach(file => dataTransfer.items.add(file));
    form.setValue('styleSamples', dataTransfer.files, { shouldValidate: true });
  };

  async function onSubmit(data: FormData) {
    setIsProcessing(true);
    setIsComplete(false);
    try {
      const fileContents = await Promise.all(
        Array.from(data.styleSamples).map(file => file.text())
      );
      const combinedStyles = fileContents.join('\n\n---\n\n');

      // In a real app, you'd save this to a user's profile, a database, or browser storage.
      // For this demo, we'll save it to localStorage.
      localStorage.setItem('teacherStyleGuide', combinedStyles);

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast({
        title: t('personalization.savedTitle'),
        description: t('personalization.savedDesc'),
      });
      setIsComplete(true);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: t('common.errorTitle'),
        description: t('personalization.error'),
      });
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="styleSamples"
            render={() => (
              <FormItem>
                <FormLabel>{t('personalization.files')}</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    multiple
                    accept=".txt,.md"
                    onChange={handleFileChange}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                </FormControl>
                <FormDescription>
                  {t('personalization.filesHelp')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">{t('personalization.selectedFiles')}</h4>
              <div className="space-y-2 rounded-md border p-2 max-h-48 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between text-sm p-1">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="font-mono text-xs truncate">{file.name}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={() => removeFile(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button type="submit" disabled={isProcessing || selectedFiles.length === 0}>
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('personalization.analyzing')}
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                {t('personalization.save')}
              </>
            )}
          </Button>
        </form>
      </Form>
      <div className="space-y-4">
        <h3 className="font-headline text-2xl font-bold">{t('personalization.status')}</h3>
        <div className="min-h-[200px]">
          {isProcessing ? (
            <Card className="h-full flex items-center justify-center border-dashed">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p>{t('personalization.learning')}</p>
              </div>
            </Card>
          ) : isComplete ? (
            <Card className="h-full flex items-center justify-center border-green-500 bg-green-500/5">
              <div className="flex flex-col items-center gap-2 text-green-700">
                <CheckCircle className="h-8 w-8" />
                <p className="font-semibold">{t('personalization.complete')}</p>
                <p className="text-sm text-center">{t('personalization.completeDesc')}</p>
              </div>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center border-dashed">
              <div className="text-center text-muted-foreground">
                <p>{t('personalization.empty')}</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
