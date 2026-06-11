import { db } from './db';

/**
 * Safety Reporting Service for HydraLearn.
 * Handles the anonymous reporting of bullying, harassment, and other safety concerns.
 */

export async function submitSafetyReport(data: {
  description: string;
  targetId?: string;
  reporterId?: string; // Optional for anonymity
}) {
  // 1. Create the report in the database
  const report = await db.safetyReport.create({
    data: {
      description: data.description,
      targetId: data.targetId,
      reporterId: data.reporterId,
      status: 'OPEN',
    },
  });

  // 2. ADMIN NOTIFICATION (Placeholder)
  // In a real production app, this would trigger an email or a Push Notification
  // to all users with the ADMIN role.
  console.log(`CRITICAL ALERT: New Safety Report submitted. ID: ${report.id}. Status: OPEN.`);

  return { success: true, reportId: report.id };
}

/**
 * Fetches all open safety reports for administrators.
 */
export async function getAdminSafetyReports() {
  return db.safetyReport.findMany({
    where: {
      status: {
        not: 'RESOLVED',
      },
    },
    include: {
      reporter: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

/**
 * Updates the status of a safety report as it moves through the resolution process.
 */
export async function updateReportStatus(reportId: string, status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED') {
  return db.safetyReport.update({
    where: { id: reportId },
    data: { status },
  });
}

/**
 * Fetches a specific report for detailed review.
 */
export async function getReportDetails(reportId: string) {
  return db.safetyReport.findUnique({
    where: { id: reportId },
    include: {
      reporter: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
}
