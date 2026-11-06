import { PageHeader } from '@/components/page-header';
import { T } from '@/components/t';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LessonPlannerForm } from './lesson-planner-form';

export default function LessonPlannerPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        titleKey="lessonPlanner.title"
        descriptionKey="lessonPlanner.description"
      />
      <Card>
        <CardHeader>
            <CardTitle><T k="lessonPlanner.cardTitle" /></CardTitle>
            <CardDescription><T k="lessonPlanner.cardDescription" /></CardDescription>
        </CardHeader>
        <CardContent>
            <LessonPlannerForm />
        </CardContent>
      </Card>
    </div>
  );
}
