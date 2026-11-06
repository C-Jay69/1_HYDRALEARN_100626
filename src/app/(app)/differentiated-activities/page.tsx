import { PageHeader } from '@/components/page-header';
import { T } from '@/components/t';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DifferentiatedActivitiesForm } from './differentiated-activities-form';

export default function DifferentiatedActivitiesPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        titleKey="differentiated.title"
        descriptionKey="differentiated.description"
      />
      <Card>
        <CardHeader>
            <CardTitle><T k="differentiated.cardTitle" /></CardTitle>
            <CardDescription><T k="differentiated.cardDescription" /></CardDescription>
        </CardHeader>
        <CardContent>
            <DifferentiatedActivitiesForm />
        </CardContent>
      </Card>
    </div>
  );
}
