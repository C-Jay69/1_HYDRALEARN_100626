# 🎓 HydraLearn by Lifejacket AI

HydraLearn is a full-stack, AI-powered educational ecosystem designed to empower teachers and protect students. Unlike generic AI tools, HydraLearn is built on a **Pedagogical Engine** that applies established learning theories (Piaget, Vygotsky, Skinner, Maslow) to generate content tailored to the student's age, subject, and emotional state.

## 🌟 The Three Heads of HydraLearn

### 📚 1. Learn (The Generator)
*   **Theory-Driven Content:** AI generates lesson plans, slides, and worksheets based on selected pedagogical strategies.
*   **Multi-Format Assessments:** Quizzes that go beyond MCQs, including matching, fill-in-the-blanks, and short answers.
*   **Engagement Layer:** Automatic "Meme Query" generation to keep students engaged with humor.
*   **Gamification:** A full XP and Badge system to incentivize learning and track progress.

### ⚙️ 2. Manage (The Assistant)
*   **Performance Analytics:** Real-time class-wide and student-specific performance tracking.
*   **Lesson Marketplace:** A peer-to-peer ecosystem where teachers can publish and acquire high-quality lesson plans.
*   **Differentiated Instruction:** AI-powered tools to create different versions of the same activity for different learning levels.

### 🛡️ 3. Protect (The Lifejacket)
*   **HydraForum:** A community space with a real-time AI Moderation layer to block bullying and harassment.
*   **HydraEar:** An anonymous, empathetic AI counselor utilizing Rogerian (Client-Centered) therapy.
*   **Safety Board:** An anonymous reporting system for immediate administrative intervention.
*   **Wellness Tracker:** Daily mood tracking with "Distress Detection" alerts for counselors.

## 🛠️ Tech Stack
*   **Framework:** Next.js 15 (App Router)
*   **AI Orchestration:** Genkit
*   **Database:** Prisma + PostgreSQL (Production) / SQLite (Local)
*   **Styling:** Tailwind CSS + Shadcn/UI
*   **AI Providers:** OpenRouter, Ollama, Hugging Face, Google Gemini

## 🚀 Quick Start
1. Clone the repo.
2. Install dependencies: `npm install`
3. Set up your `.env` (see `.env.example`).
4. Initialize database: `npx prisma db push`
5. Run development server: `npm run dev`
