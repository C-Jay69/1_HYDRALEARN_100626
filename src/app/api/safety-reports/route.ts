import { NextRequest, NextResponse } from 'next/server';
import { submitSafetyReport, getAdminSafetyReports, updateReportStatus } from '@/lib/safety-reports';

export async function GET() {
  try {
    const reports = await getAdminSafetyReports();
    return NextResponse.json(reports);
  } catch (error) {
    console.error('Error fetching safety reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch safety reports' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { description, targetId, reporterId } = body;

    if (!description) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }

    const result = await submitSafetyReport({
      description,
      targetId,
      reporterId,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Error submitting safety report:', error);
    return NextResponse.json(
      { error: 'Failed to submit report', details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
