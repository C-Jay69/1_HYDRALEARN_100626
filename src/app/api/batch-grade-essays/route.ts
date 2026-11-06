import { NextRequest, NextResponse } from 'next/server';
import { batchGradeEssays } from '@/ai/flows/batch-grade-essays';
import { saveGeneratedContent } from '@/lib/saved-content';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { essays, gradeLevel, rubric, teacherNotes, styleGuide, locale } = body;
        const outputLocale = locale === 'es' ? 'es' : 'en';

        if (!essays || !gradeLevel || !rubric) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const result = await batchGradeEssays({
            essays,
            gradeLevel,
            rubric,
            teacherNotes:
                outputLocale === 'es'
                    ? `${teacherNotes ? `${teacherNotes}\n\n` : ''}Write the grades, feedback and reasoning in Spanish.`
                    : teacherNotes,
            styleGuide,
        });

        const essayCount = Array.isArray(essays) ? essays.length : 0;
        const saved = await saveGeneratedContent({
            kind: 'BATCH_ESSAY_GRADE',
            title: `Batch essay grades (${essayCount} essay${essayCount === 1 ? '' : 's'}) — ${gradeLevel}`,
            content:
                result.csvContent ||
                result.results
                    .map(
                        (r) =>
                            `## ${r.fileName}\n\n**Grade:** ${r.grade}\n\n${r.feedback}\n\n**Reasoning:** ${r.reasoning}`
                    )
                    .join('\n\n---\n\n'),
            metadata: {
                gradeLevel,
                rubric,
                teacherNotes,
                results: result.results,
                locale: outputLocale,
            },
        });

        return NextResponse.json({ ...result, saved });
    } catch (error: any) {
        console.error('Error in batch grading:', error);
        return NextResponse.json(
            { error: 'Failed to grade essays in batch', details: error?.message || String(error) },
            { status: 500 }
        );
    }
}
