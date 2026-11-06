import { NextRequest, NextResponse } from 'next/server';
import { aiGradeEssays } from '@/ai/flows/ai-grade-essays';
import { saveGeneratedContent } from '@/lib/saved-content';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { essay, gradeLevel, rubric, teacherNotes, styleGuide, locale } = body;
        const outputLocale = locale === 'es' ? 'es' : 'en';

        if (!essay || !gradeLevel || !rubric) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const result = await aiGradeEssays({
            essay,
            gradeLevel,
            rubric,
            teacherNotes:
                outputLocale === 'es'
                    ? `${teacherNotes ? `${teacherNotes}\n\n` : ''}Write the grade, feedback and reasoning in Spanish.`
                    : teacherNotes,
            styleGuide,
        });

        const saved = await saveGeneratedContent({
            kind: 'ESSAY_GRADE',
            title: `Essay grade: ${gradeLevel} — ${result.grade}`,
            content: `**Grade:** ${result.grade}\n\n## Feedback\n\n${result.feedback}\n\n## Reasoning (for teacher)\n\n${result.reasoning}`,
            metadata: {
                gradeLevel,
                grade: result.grade,
                rubric,
                teacherNotes,
                essayPreview: essay.slice(0, 500),
                locale: outputLocale,
            },
        });

        return NextResponse.json({ ...result, saved });
    } catch (error: any) {
        console.error('Error grading essay:', error);
        return NextResponse.json(
            { error: 'Failed to grade essay', details: error?.message || String(error) },
            { status: 500 }
        );
    }
}
