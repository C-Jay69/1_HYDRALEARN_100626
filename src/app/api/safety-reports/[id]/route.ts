import { NextResponse } from 'next/server';
import { updateReportStatus } from '@/lib/safety-reports';

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { reportId, status } = body;

    if (!reportId || !status) {
      return NextResponse.json(
        { error: 'Report ID and status are required' },
        { status: 400 }
      );
    }

    const report = await updateReportStatus(reportId, status);
    return NextResponse.json(report);
  } catch (error: any) {
    console.error('Error updating safety report:', error);
    return NextResponse.json(
      { error: 'Failed to update report', details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
