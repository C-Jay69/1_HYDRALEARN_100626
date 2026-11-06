import { PageHeader } from '@/components/page-header';
import { T } from '@/components/t';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PersonalizationForm } from './personalization-form';

export default function PersonalizationPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        titleKey="personalization.title"
        descriptionKey="personalization.description"
      />
      <Card>
        <CardHeader>
            <CardTitle><T k="personalization.cardTitle" /></CardTitle>
            <CardDescription>
                <T k="personalization.cardDescription" />
            </CardDescription>
        </CardHeader>
        <CardContent>
            <PersonalizationForm />
        </CardContent>
      </Card>
    </div>
  );
}
