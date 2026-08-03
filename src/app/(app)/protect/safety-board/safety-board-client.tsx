'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, Send, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type SafetyReport = {
  id: string;
  description: string;
  status: string;
  createdAt: string;
  reporter: { name: string | null; email: string | null } | null;
};

const statusIcons: Record<string, React.ReactNode> = {
  OPEN: <Clock className="h-4 w-4 text-yellow-500" />,
  INVESTIGATING: <AlertCircle className="h-4 w-4 text-blue-500" />,
  RESOLVED: <CheckCircle className="h-4 w-4 text-green-500" />,
};

const statusColors: Record<string, string> = {
  OPEN: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  INVESTIGATING: 'bg-blue-100 text-blue-800 border-blue-200',
  RESOLVED: 'bg-green-100 text-green-800 border-green-200',
};

export function SafetyBoardClient() {
  const [reports, setReports] = useState<SafetyReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState('');
  const { toast } = useToast();

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/safety-reports');
      if (response.ok) {
        const data = await response.json();
        setReports(data);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleSubmitReport = async () => {
    if (!description.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/safety-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          reporterId: reporterName ? undefined : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit report');
      }

      toast({
        title: 'Report Submitted',
        description: 'Your report has been submitted and is now being reviewed by an administrator.',
        variant: 'default',
      });

      setDescription('');
      setReporterName('');
      fetchReports();
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to submit report. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <ShieldAlert className="h-5 w-5" />
          Submit an Anonymous Report
        </h3>
        <p className="text-sm text-muted-foreground">
          Describe the concern in detail. You may optionally provide your name,
          or leave it blank for complete anonymity.
        </p>

        <Textarea
          placeholder="Describe the situation (be as detailed as possible)..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[120px]"
          disabled={isSubmitting}
        />

        <Input
          placeholder="Your name (optional - leave blank for full anonymity)"
          value={reporterName}
          onChange={(e) => setReporterName(e.target.value)}
          disabled={isSubmitting}
        />

        <Button
          onClick={handleSubmitReport}
          disabled={isSubmitting || !description.trim()}
          className="w-full"
        >
          {isSubmitting ? (
            'Submitting...'
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Submit Anonymous Report
            </>
          )}
        </Button>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Recent Reports (Admin View)</h3>
        {isLoading ? (
          <p className="text-muted-foreground">Loading reports...</p>
        ) : reports.length === 0 ? (
          <p className="text-muted-foreground">No reports submitted yet.</p>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <Card key={report.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">
                      {report.description}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className={statusColors[report.status] || ''}
                    >
                      <span className="flex items-center gap-1">
                        {statusIcons[report.status]}
                        {report.status}
                      </span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Reported: {new Date(report.createdAt).toLocaleString()}
                    {report.reporter?.name && ` | By: ${report.reporter.name}`}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
