import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HydraEarChat } from './hydra-ear-chat';

export default function HydraEarPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="HydraEar"
        description="An anonymous AI counselor providing a safe, non-judgmental space to talk. Based on Rogerian (Client-Centered) Therapy principles."
      />
      <Card>
        <CardHeader>
          <CardTitle>Anonymous AI Counselor</CardTitle>
          <CardDescription>
            Everything you share is confidential and anonymous. HydraEar is here to listen, not to judge.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HydraEarChat />
        </CardContent>
      </Card>
    </div>
  );
}
