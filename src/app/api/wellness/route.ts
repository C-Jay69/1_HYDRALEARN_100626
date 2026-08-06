import { NextRequest, NextResponse } from 'next/server';
import { submitWellnessCheckin, getStudentWellnessHistory } from '@/lib/wellness';
import { ensurePlaceholderUser, PLACEHOLDER_USER_ID } from '@/lib/placeholder-user';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mood, note } = body;

    if (!mood) {
      return NextResponse.json(
        { error: 'Mood is required' },
        { status: 400 }
      );
    }

    // For now, use a placeholder student ID (auth not yet integrated)
    await ensurePlaceholderUser();
    const studentId = PLACEHOLDER_USER_ID;

    const result = await submitWellnessCheckin({
      studentId,
      mood,
      note,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Error submitting wellness checkin:', error);
    return NextResponse.json(
      { error: 'Failed to submit checkin', details: error?.message || String(error) },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // For now, use a placeholder student ID (auth not yet integrated)
    await ensurePlaceholderUser();
    const studentId = PLACEHOLDER_USER_ID;

    const history = await getStudentWellnessHistory(studentId);
    return NextResponse.json(history);
  } catch (error) {
    console.error('Error fetching wellness history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wellness history' },
      { status: 500 }
    );
  }
}
