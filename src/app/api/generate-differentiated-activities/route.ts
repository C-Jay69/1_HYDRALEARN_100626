import { NextRequest, NextResponse } from 'next/server';
import { generateDifferentiatedActivities } from '@/ai/flows/generate-differentiated-activities';
import { saveGeneratedContent } from '@/lib/saved-content';

export async function POST(req: NextRequest) {
    try {
        console.log('Received differentiated activities request');
        const body = await req.json();
        console.log('Request body:', JSON.stringify(body, null, 2));

        const { topic, gradeLevel, students, subject, tone, locale } = body;
        const outputLocale = locale === 'es' ? 'es' : 'en';

        if (!topic || !gradeLevel || !students) {
            console.error('Missing required fields in differentiated activities request');
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        console.log(`Calling flow for topic: ${topic}, students count: ${students.length}`);
        const result = await generateDifferentiatedActivities({
            topic,
            subject: subject || 'General',
            gradeLevel,
            students,
            tone:
                outputLocale === 'es'
                    ? `${tone || 'Academic'}. Write the entire response in Spanish.`
                    : tone || 'Academic',
        });
        console.log('Differentiated activities generated successfully');

        const content = result.activities
            .map(
                (activity) =>
                    `### ${activity.studentId}\n\n${activity.activityDescription}\n\n**Why this works:** ${activity.justification}`
            )
            .join('\n\n---\n\n');

        const saved = await saveGeneratedContent({
            kind: 'DIFFERENTIATED_ACTIVITIES',
            title: `Activities: ${topic} — ${gradeLevel}`,
            content,
            metadata: {
                topic,
                subject: subject || 'General',
                gradeLevel,
                students,
                activities: result.activities,
                locale: outputLocale,
            },
        });

        return NextResponse.json({ ...result, saved });
    } catch (error: any) {
        console.error('Error generating differentiated activities:', error);
        return NextResponse.json(
            { error: 'Failed to generate differentiated activities', details: error?.message || String(error) },
            { status: 500 }
        );
    }
}
