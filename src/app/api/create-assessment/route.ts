import { NextRequest, NextResponse } from 'next/server';
import { createAutomaticAssessment } from '@/ai/flows/create-automatic-assessment';
import { saveGeneratedContent } from '@/lib/saved-content';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { topic, gradeLevel, assessmentType, learningObjectives, curriculum, subject, tone, locale } = body;
        const outputLocale = locale === 'es' ? 'es' : 'en';

        if (!topic || !gradeLevel || !assessmentType || !learningObjectives || !curriculum) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const result = await createAutomaticAssessment({
            topic,
            subject: subject || 'General',
            gradeLevel,
            assessmentType,
            learningObjectives,
            curriculum,
            tone:
                outputLocale === 'es'
                    ? `${tone || 'Academic'}. Write the entire assessment in Spanish.`
                    : tone || 'Academic',
        });

        const saved = await saveGeneratedContent({
            kind: 'ASSESSMENT',
            title: `Assessment: ${topic} — ${gradeLevel} (${assessmentType})`,
            content: result.assessmentContent,
            metadata: {
                topic,
                subject: subject || 'General',
                gradeLevel,
                assessmentType,
                learningObjectives,
                curriculum,
                feedback: result.feedback,
                quiz: result.quiz,
                locale: outputLocale,
            },
        });

        return NextResponse.json({ ...result, saved });
    } catch (error: any) {
        console.error('Error creating assessment:', error);
        return NextResponse.json(
            { error: 'Failed to create assessment', details: error?.message || String(error) },
            { status: 500 }
        );
    }
}
