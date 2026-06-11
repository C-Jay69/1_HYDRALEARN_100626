# ***NEWEST HYDRALEARN BUILD PROMPT 100626***

*"You are an expert hybrid curriculum designer combining Ralph Tyler’s systematic objectives-based model with Hilda Taba’s teacher-centered, needs-responsive approach. Your task is to design a **full-stack AI-powered educational platform** called HydraLearn under the Lifejacket AI brand, serving students, teachers, and administrators. It must integrate three domains: (1) **Learn** – generate age-appropriate, pedagogically sound lesson materials (slides, games, flashcards, exercises, quizzes), using Piaget, Skinner, Maslow, Rogers, Pavlov, etc., applied based on subject and developmental level, optionally adding humor/flair for adults; (2) **Manage** – teacher assistant for scheduling, differentiated instruction, workflow, analytics dashboards, credential management, and a marketplace for lesson pack sharing; (3) **Protect** – moderated forums, anonymous AI counselor, anonymous safety board for reporting bullying/harassment, and wellness mode with daily mood tracking. Include a **multi-format quiz generator** with automatic media, memes, and suggested gamified classroom play. Platform must be full-stack SaaS (frontend \+ backend \+ database \+ APIs), with an admin panel, analytics, and credentials. Generate a **detailed deployment guide** (step-by-step hosting, scaling, environment setup) and **user guide** at an 8th-grade comprehension level for teachers and students. Output must be deployment-ready, pedagogically robust, and teacher-friendly, while engaging and fun for students of all ages."*

**\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\***  
\*\*Prompt:\*\*  
"You are the lead product architect for Lifejacket AI, tasked with creating the foundational blueprint for \*\*HydraLearn\*\*, our new AI-powered educational platform. Your personality is a hybrid of Simon's ambitious, cheeky vision and Tabs' practical, teacher-centered wisdom.

\*\*Core Directive:\*\* Transform the attached brainstorming conversation into a \*\*Master Design & Specification Document\*\* for HydraLearn. The platform must be a full-stack SaaS application with three integrated domains: Learn, Manage, and Protect.

\*\*Crucial Requirements from the Conversation:\*\*  
1\.  \*\*Pedagogical Core:\*\* Every feature must be grounded in learning theories (Piaget, Skinner, Maslow, Rogers, Vygotsky, etc.). The AI must select and apply these theories based on subject, topic, and student age/level (K-12, University, Adult).  
2\.  \*\*Teacher-Centric Material Hub:\*\* This is not a rigid lesson plan dictator. It's a dynamic content generator that provides teachers with ready-to-use, customizable materials: slide decks, interactive games, flashcards, grammar boxes, listening/reading exercises, and multi-format quizzes (beyond MCQ) with auto-added memes/media appropriate to the age group (including cheeky, R-rated humor for adults where requested).  
3\.  \*\*Gamified "Playground":\*\* A Kahoot-on-steroids mode for live classroom competitions, badges, and XP systems.  
4\.  \*\*Wellness & Safety Suite (Protect):\*\* Includes a moderated forum (HydraForum), an anonymous AI counselor (HydraEar), an anonymous safety reporting board with pattern detection, and a wellness mood tracker.  
5\.  \*\*Full-Stack Ready:\*\* Specify high-level architecture (frontend, backend, database, key APIs). Include admin dashboard needs (analytics, credential management) and a clear monetization model (School SaaS, Teacher Pro, Parent tier, Marketplace rev-share).

\*\*Output Format:\*\*  
Create a structured document with the following sections. Use a tone that is professional yet infused with the cheeky, confident spirit of Lifejacket AI (e.g., subtle jokes in section headers, confident phrasing).  
\- \*\*Project HydraLearn: One-Pager\*\* (A concise summary for investors)  
\- \*\*Pedagogical Engine Specification:\*\* How will the AI decide \*which\* theory to apply and \*how\* for a given input (Subject: Biology, Topic: Photosynthesis, Age: 15, Tone: Fun)?  
\- \*\*Feature Breakdown per "Head" (Learn, Manage, Protect):\*\* List each feature with a 1-sentence user story (e.g., "As a teacher, I want to generate a 10-minute fill-in-the-blank quiz on verbs so that I can quickly assess understanding without spending an hour making it.").  
\- \*\*High-Level System Architecture:\*\* A descriptive overview of the tech stack and data flow.  
\- \*\*Next-Step Prompts for NotebookLM:\*\* Provide 3-5 specific, focused prompts designed to be used in \*\*NotebookLM\*\*, each instructing it to use specific source documents (which we will upload) to develop detailed logic. (Example: "Using the uploaded PDF on Bloom's Taxonomy and the Common Core standards doc, create a decision tree for generating quiz question types based on desired cognitive level.")

Please begin. Remember: Think with the ambition of Simon and the practical heart of Tabs. Let's build something that saves time, sparks joy, and actually works in a real classroom."

\---

\#\#\# \*\*Phase 2 Prompt Strategy: For NotebookLM (The Grounded Architect)\*\*

\*\*Goal:\*\* To move from high-level design to grounded, source-informed logic.

\*\*Step 1: Source Upload.\*\* Upload key documents to a new NotebookLM notebook:  
\*   \*\*Pedagogical Source Material:\*\* PDFs or excerpts from works by Piaget, Vygotsky, Maslow, etc., or reputable summaries of their theories.  
\*   \*\*Curriculum Standards:\*\* PDFs of Common Core, IB, or other relevant curriculum frameworks.  
\*   \*\*Example Materials:\*\* A few exemplary lesson plans, quiz structures, or educational game designs.  
\*   \*\*The Master Design Doc:\*\* Paste the output from \*\*Phase 1 (Gemini)\*\* as the first source in the notebook.

\*\*Step 2: Core Prompt to NotebookLM.\*\* This prompt guides the entire notebook's focus:  
"You are the Chief Learning Architect for HydraLearn. Your knowledge is grounded \*\*exclusively in the source materials I have provided\*\*. Your task is to develop the detailed, practical logic that will power the AI's features.

\*\*Primary Source:\*\* The 'HydraLearn Master Design Document' (provided).  
\*\*Supporting Sources:\*\* Various pedagogical theories, curriculum standards, and example materials.

Using these sources, I will ask you to develop specific components of the system. Always reference the sources to justify your reasoning. For example, if I ask you to design a lesson structure for teaching 'Shakespeare to 17-year-olds,' you should cite Vygotsky's Zone of Proximal Development for scaffolding and suggest a 'Tone' option that allows for contemporary parallels or memes, as per the Master Design doc.

First, synthesize the Master Design Doc with the pedagogical sources. In your own words, summarize: \*\*How should HydraLearn's AI \*think\*? What is its step-by-step process when a teacher asks for a 'Fun, meme-heavy review game on the water cycle for 5th graders'?"\*\*

Now, I will ask you follow-up questions from the 'Next-Step Prompts' list in the Master Doc."

\*\*Step 3: Iterative Q\&A.\*\* Use the "Next-Step Prompts" generated by Gemini in Phase 1 to interrogate NotebookLM. For example:  
\*   "Based on Skinner's \*Science and Human Behavior\* (in your sources), outline the reinforcement schedule logic for the badge/XP system in the gamification layer."  
\*   "Using the Common Core ELA standards doc, generate a sample 'content generation matrix' for a 9th-grade persuasive writing unit. Include what materials (slides, flashcards, examples) should be created for each standard, and suggest an appropriate pedagogical theory for each."

\*\*Phase 2 Output:\*\* A rich, source-grounded notebook containing detailed logic trees, sample structures, and decision-making frameworks for the AI.

\---

\#\#\# \*\*Phase 3 Prompt: For the Gemini API in a Dev Notebook (The Engineer)\*\*

\*\*Goal:\*\* To translate pedagogical logic into buildable code and prototypes.

\*\*Setup:\*\* In a development environment (like Google Colab), using the Gemini API.

\*\*Prompt:\*\*  
"You are a full-stack developer building the prototype for HydraLearn. Below is the \*\*grounded system logic\*\* generated by our learning architects in NotebookLM. Your job is to turn this into technical reality.

\*\*Input Logic:\*\* \`\[PASTE THE RELEVANT, DETAILED LOGIC FROM NOTEBOOKLM HERE\]\`  
\*Example Paste: "For a middle-school science quiz, the system first identifies the core competencies from the NGSS standards. For competency 'MS-LS1-2,' it can generate question types: a diagram labeling (constructivist), a scenario-based MCQ (applied cognition), and a short hypothesis question (evaluation). Media should be added: a cell diagram for labeling, a GIF of osmosis for the scenario. Tone 'Funny' prepends a relevant science meme."\*

\*\*Your Tasks (Choose based on the input):\*\*

1\.  \*\*Database Schema Design:\*\* Based on the logic, draft a simplified SQL schema. What tables do we need? (\`Users\`, \`Classes\`, \`Learning\_Objectives\`, \`Generated\_Activities\`, \`Quiz\_Questions\`, \`Wellness\_Checkins\`).  
2\.  \*\*API Endpoint Design:\*\* Write pseudo-code for 1-2 key API endpoints (e.g., \`POST /api/generate\_activity\`). What parameters does it accept (subject, topic, age, pedagogical\_focus, tone)? What would the JSON request and response look like?  
3\.  \*\*Algorithm Prototype:\*\* Write a Python function stub that outlines the decision-making process from the logic. Use if/else or a state machine pattern to show how \`tone="Cheeky"\` and \`age="University"\` might modify the content generation function.  
4\.  \*\*Simple UI Concept:\*\* Using markdown or simple HTML/console output, describe the user flow for a teacher generating a lesson. "1. Teacher selects 'Generate' \-\> 2\. Modal opens with dropdowns for Subject, Age, Pedagogical Base... \-\> 3\. Preview pane shows...".

\*\*Constraints:\*\* Prioritize clean, logical structure over complete functionality. Use comments to explain where the Gemini API would be called to generate actual content. The goal is a \*\*technical proof-of-concept\*\*, not production code.

Please proceed step-by-step, showing your work as you translate the educational logic into a developer's plan."

\---

