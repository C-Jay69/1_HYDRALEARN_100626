import { Suspense } from 'react';
import { PageHeader } from '@/components/page-header';
import { T } from '@/components/t';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StudioForm } from './studio-form';

export default function StudioPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        titleKey="studio.title"
        descriptionKey="studio.description"
      />
      <Card>
        <CardHeader>
          <CardTitle><T k="studio.cardTitle" /></CardTitle>
          <CardDescription><T k="studio.cardDescription" /></CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<T k="studio.loading" />}>
            <StudioForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
