import { NextRequest, NextResponse } from 'next/server';
import { generateLessonPlan } from '@/ai/flows/generate-lesson-plan';
import { saveGeneratedContent } from '@/lib/saved-content';

export async function POST(req: NextRequest) {
  try {
    console.log('Received lesson plan generation request');
    const body = await req.json();
    console.log('Request body:', JSON.stringify(body, null, 2));

    const { studentNeeds, curriculum, objectives, gradeLevel, subject, topic, tone, locale } = body;
    const outputLocale = locale === 'es' ? 'es' : 'en';

    console.log('Validating individual fields...');
    console.log(`- studentNeeds: ${!!studentNeeds} (${studentNeeds?.length || 0} chars)`);
    console.log(`- curriculum: ${!!curriculum}`);
    console.log(`- objectives: ${!!objectives}`);
    console.log(`- gradeLevel: ${!!gradeLevel}`);
    console.log(`- subject: ${!!subject}`);
    console.log(`- topic: ${!!topic} (${topic?.length || 0} chars)`);

    if (!studentNeeds || !curriculum || !objectives || !gradeLevel || !subject) {
      console.error('Missing required fields in request body');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Diagnostic check for API key (do not log the key itself!)
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error('CRITICAL: OPENROUTER_API_KEY is missing from environment');
      return NextResponse.json(
        { error: 'AI service configuration error: API key missing' },
        { status: 500 }
      );
    }
    console.log('API key found in environment');

    console.log('Calling generateLessonPlan flow...');
    const result = await generateLessonPlan({
      studentNeeds,
      curriculum,
      objectives,
      gradeLevel,
      subject,
      topic: topic || subject,
      tone:
        outputLocale === 'es'
          ? `${tone || 'Academic'}. Write the entire lesson plan in Spanish.`
          : tone || 'Academic',
    });
    console.log('Lesson plan generated successfully');

    const saved = await saveGeneratedContent({
      kind: 'LESSON_PLAN',
      title: `Lesson plan: ${topic || subject} — ${gradeLevel}`,
      content: result.lessonPlan,
      metadata: {
        subject,
        gradeLevel,
        topic,
        curriculum,
        objectives,
        studentNeeds,
        tone: tone || 'Academic',
        locale: outputLocale,
      },
    });

    return NextResponse.json({ ...result, saved });
  } catch (error: any) {
    console.error('Error generating lesson plan:', error);
    return NextResponse.json(
      { error: 'Failed to generate lesson plan', details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
