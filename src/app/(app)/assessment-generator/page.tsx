import { PageHeader } from '@/components/page-header';
import { T } from '@/components/t';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AssessmentGeneratorForm } from './assessment-generator-form';

export default function AssessmentGeneratorPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        titleKey="assessment.title"
        descriptionKey="assessment.description"
      />
      <Card>
        <CardHeader>
            <CardTitle><T k="assessment.cardTitle" /></CardTitle>
            <CardDescription><T k="assessment.cardDescription" /></CardDescription>
        </CardHeader>
        <CardContent>
            <AssessmentGeneratorForm />
        </CardContent>
      </Card>
    </div>
  );
}
