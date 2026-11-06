import { PageHeader } from '@/components/page-header';
import { T } from '@/components/t';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EssayGraderForm } from './essay-grader-form';

export default function EssayGraderPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        titleKey="essay.title"
        descriptionKey="essay.description"
      />
      <Card>
        <CardHeader>
            <CardTitle><T k="essay.cardTitle" /></CardTitle>
            <CardDescription><T k="essay.cardDescription" /></CardDescription>
        </CardHeader>
        <CardContent>
            <EssayGraderForm />
        </CardContent>
      </Card>
    </div>
  );
}
