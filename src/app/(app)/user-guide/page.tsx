import { PageHeader } from '@/components/page-header';
import { T } from '@/components/t';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function UserGuidePage() {
  return (
    <div className="space-y-8">
      <PageHeader
        titleKey="userGuide.title"
        descriptionKey="userGuide.description"
      />

      <Accordion type="multiple" className="w-full space-y-4">
        {/* For Teachers Section */}
        <AccordionItem value="for-teachers" className="bg-card border rounded-lg">
          <AccordionTrigger className="px-6 text-lg hover:no-underline font-semibold">
            <T k="userGuide.teachers" />
          </AccordionTrigger>
          <AccordionContent className="px-6 space-y-4">
            <p className="text-muted-foreground"><T k="userGuide.teachersIntro" /></p>

            <div>
              <h4 className="font-semibold mb-1"><T k="userGuide.lessonPlanner" /></h4>
              <p className="text-sm text-muted-foreground"><T k="userGuide.lessonPlannerText" /></p>
            </div>

            <div>
              <h4 className="font-semibold mb-1"><T k="userGuide.assessmentGenerator" /></h4>
              <p className="text-sm text-muted-foreground"><T k="userGuide.assessmentGeneratorText" /></p>
            </div>

            <div>
              <h4 className="font-semibold mb-1"><T k="userGuide.essayGrader" /></h4>
              <p className="text-sm text-muted-foreground"><T k="userGuide.essayGraderText" /></p>
            </div>

            <div>
              <h4 className="font-semibold mb-1"><T k="userGuide.gamification" /></h4>
              <p className="text-sm text-muted-foreground"><T k="userGuide.gamificationText" /></p>
            </div>

            <div>
              <h4 className="font-semibold mb-1"><T k="userGuide.safety" /></h4>
              <p className="text-sm text-muted-foreground"><T k="userGuide.safetyText" /></p>
            </div>

            <div>
              <h4 className="font-semibold mb-1"><T k="userGuide.library" /></h4>
              <p className="text-sm text-muted-foreground"><T k="userGuide.libraryText" /></p>
            </div>

          </AccordionContent>
        </AccordionItem>

        {/* For Students Section */}
        <AccordionItem value="for-students" className="bg-card border rounded-lg">
          <AccordionTrigger className="px-6 text-lg hover:no-underline font-semibold">
            <T k="userGuide.students" />
          </AccordionTrigger>
          <AccordionContent className="px-6 space-y-4">
            <p className="text-muted-foreground"><T k="userGuide.studentsIntro" /></p>

            <div>
              <h4 className="font-semibold mb-1"><T k="userGuide.challenges" /></h4>
              <p className="text-sm text-muted-foreground"><T k="userGuide.challengesText" /></p>
            </div>

            <div>
              <h4 className="font-semibold mb-1"><T k="userGuide.leaderboard" /></h4>
              <p className="text-sm text-muted-foreground"><T k="userGuide.leaderboardText" /></p>
            </div>

            <div>
              <h4 className="font-semibold mb-1"><T k="userGuide.badges" /></h4>
              <p className="text-sm text-muted-foreground"><T k="userGuide.badgesText" /></p>
            </div>
          </AccordionContent>
        </AccordionItem>

      </Accordion>
    </div>
  );
}
