import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WellnessTrackerClient } from './wellness-tracker-client';

export default function WellnessPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Wellness Tracker"
        description="Daily mood tracking to monitor emotional wellbeing. Helps teachers identify students who may need support."
      />
      <Card>
        <CardHeader>
          <CardTitle>Daily Check-in</CardTitle>
          <CardDescription>
            Track your mood each day. If you report negative moods for 3 consecutive
            days, an alert is sent to administrators.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WellnessTrackerClient />
        </CardContent>
      </Card>
    </div>
  );
}
