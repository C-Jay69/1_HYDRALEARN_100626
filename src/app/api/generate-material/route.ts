import { NextRequest, NextResponse } from 'next/server';
import { generateLearningMaterial } from '@/ai/flows/generate-learning-material';
import { saveGeneratedContent } from '@/lib/saved-content';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { materialType, topic, gradeLevel, instructions, subject, tone, locale } = body;
    const outputLocale = locale === 'es' ? 'es' : 'en';

    if (!materialType || !topic || !gradeLevel) {
      return NextResponse.json(
        { error: 'Missing required fields: materialType, topic, or gradeLevel' },
        { status: 400 }
      );
    }

    const result = await generateLearningMaterial({
      materialType,
      topic,
      subject: subject || 'General',
      gradeLevel,
      tone:
        outputLocale === 'es'
          ? `${tone || 'Academic'}. Write the entire material in Spanish.`
          : tone || 'Academic',
      instructions,
    });

    const saved = await saveGeneratedContent({
      kind: 'LEARNING_MATERIAL',
      title: `${materialType}: ${topic} — ${gradeLevel}`,
      content: result.content,
      metadata: {
        materialType,
        topic,
        subject: subject || 'General',
        gradeLevel,
        instructions,
        locale: outputLocale,
      },
    });

    return NextResponse.json({ ...result, saved });
  } catch (error: any) {
    console.error('Error generating learning material:', error);
    return NextResponse.json(
      { error: 'Failed to generate learning material', details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
