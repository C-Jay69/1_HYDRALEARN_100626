import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SafetyBoardClient } from './safety-board-client';

export default function SafetyBoardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Safety Board"
        description="Anonymous reporting system for bullying, harassment, and safety concerns. All reports are reviewed by administrators."
      />
      <Card>
        <CardHeader>
          <CardTitle>Report a Safety Concern</CardTitle>
          <CardDescription>
            Reports are anonymous. If you are in immediate danger, contact emergency services.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SafetyBoardClient />
        </CardContent>
      </Card>
    </div>
  );
}
