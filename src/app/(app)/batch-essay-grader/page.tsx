import { PageHeader } from '@/components/page-header';
import { T } from '@/components/t';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BatchEssayGraderForm } from './batch-essay-grader-form';

export default function BatchEssayGraderPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        titleKey="batchEssay.title"
        descriptionKey="batchEssay.description"
      />
      <Card>
        <CardHeader>
            <CardTitle><T k="batchEssay.cardTitle" /></CardTitle>
            <CardDescription><T k="batchEssay.cardDescription" /></CardDescription>
        </CardHeader>
        <CardContent>
            <BatchEssayGraderForm />
        </CardContent>
      </Card>
    </div>
  );
}
