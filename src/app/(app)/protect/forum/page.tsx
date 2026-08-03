import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ForumClient } from './forum-client';

export default function ForumPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="HydraForum"
        description="A safe, AI-moderated space for students to discuss, ask questions, and learn together."
      />
      <Card>
        <CardHeader>
          <CardTitle>Community Discussions</CardTitle>
          <CardDescription>
            All posts are moderated by our AI Safety Guard before being published.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ForumClient />
        </CardContent>
      </Card>
    </div>
  );
}
