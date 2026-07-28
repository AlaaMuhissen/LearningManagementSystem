// services/geminiService.js
//
// Wraps calls to Google's Gemini API to generate coding exercises.
// Free tier — no credit card required. Get a key at https://aistudio.google.com/apikey
// Add it to your .env as: GEMINI_API_KEY=your_key_here
//
// Used by:
//  - POST /api/ai/generate-exercise, called from:
//      1. TeacherExerciseForm's "Generate with AI" button (pre-fills the create form)
//      2. StudentPractice's practice flow (ephemeral question, not saved to DB)

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Flash-Lite has the most generous free-tier limits and is more than enough
// for occasional question generation. Google retires model versions over
// time — if you hit a 404 "model no longer available" error again later,
// check https://ai.google.dev/gemini-api/docs/models for the current name.
const GEMINI_MODEL = 'gemini-3.1-flash-lite';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

const LEVEL_DESCRIPTIONS = {
  1: 'Guided Drag & Drop — the student drags code blocks into the correct order. Provide 3-6 short blocks (each a single line or short snippet) that must be placed in a specific sequence.',
  2: 'Build Before Run — like level 1, but the student arranges blocks in any order that produces valid output. Provide 3-6 blocks.',
  3: 'Free Coding — the student writes code from scratch in an editor. Provide either expected_output (for HTML/CSS) or test_cases (for JavaScript/Python/Java) to check correctness.',
};

function buildPrompt({ language, level, topic }) {
  const levelDesc = LEVEL_DESCRIPTIONS[level] || LEVEL_DESCRIPTIONS[1];

  return `You are generating a coding exercise for a learn-to-code platform.

Language: ${language}
Level: ${level} — ${levelDesc}
${topic ? `Topic focus: ${topic}` : 'Topic: pick something appropriate for a beginner/intermediate learner.'}

Return ONLY valid JSON, no markdown fences, no commentary, matching exactly this shape:

{
  "question_text": "string — clear instructions for the student",
  "blocks": ["array of strings — ONLY for level 1 or 2, each a short code snippet/line the student will arrange. Empty array for level 3."],
  "hint": "string — a helpful hint that doesn't give away the full answer",
  "expected_output": "string or null — ONLY for level 3 + html/css, the correct rendered HTML/CSS solution. null otherwise.",
  "test_cases": ["array of strings, or null — ONLY for level 3 + javascript/python/java: strings that must appear in the program's output. null otherwise."],
  "example_solution": "string — ONLY for level 3, full working code that solves the exercise in the given language (this is the same thing as expected_output for html/css, or working source code that satisfies the test_cases for javascript/python/java). Empty string for level 1/2.",
  "reward": "number — suggested points, between 5 and 20 based on difficulty"
}

Keep the question appropriate for the specified level and language. Do not include any text outside the JSON object.`;
}

async function generateExercise({ language, level, topic }) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set in your environment variables.');
  }

  const prompt = buildPrompt({ language, level, topic });

  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.9,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    throw new Error('Gemini returned no content — it may have blocked the prompt.');
  }

  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch (err) {
    throw new Error('Gemini returned invalid JSON: ' + rawText.slice(0, 200));
  }

  if (!parsed.question_text) {
    throw new Error('Generated exercise is missing question_text.');
  }

  const numLevel = Number(level);

  // Normalize into exactly the shape your exercises table / forms expect
  return {
    question_text: parsed.question_text,
    level: numLevel,
    language,
    reward: Number(parsed.reward) || 5,
    blocks: numLevel <= 2
      ? (Array.isArray(parsed.blocks) ? parsed.blocks.filter(b => b?.trim?.()) : [])
      : [],
    hint: parsed.hint || null,
    expected_output: numLevel === 3 && ['html', 'css'].includes(language)
      ? (parsed.expected_output || '')
      : null,
    test_cases: numLevel === 3 && ['javascript', 'python', 'java'].includes(language)
      ? (Array.isArray(parsed.test_cases) ? parsed.test_cases.filter(t => t?.trim?.()) : [])
      : null,
    example_solution: numLevel === 3 ? (parsed.example_solution || '') : '',
  };
}

// ---------------------------------------------------------------------------
// Chat mode — used by the animated robot button (AIRobotButton on the frontend)
// ---------------------------------------------------------------------------

const CHAT_MODEL = 'gemini-3.1-flash-lite';
const CHAT_URL = `https://generativelanguage.googleapis.com/v1beta/models/${CHAT_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

const STUDENT_SYSTEM_PROMPT = `You are a friendly, patient coding tutor inside a learn-to-code platform called CodeQuest.

Your job is to GUIDE the student toward understanding, never to hand them the finished answer:
- Ask leading questions, explain the underlying concept, point out what's likely wrong, suggest what to look into next.
- You may give small, generic example snippets to illustrate a concept (e.g. "here's how a for-loop looks in general"), but do NOT write the complete, directly copy-pasteable solution to their specific exercise or homework.
- If the student directly asks for "the answer" or to "just give me the code", gently decline and redirect them to think it through step by step instead — encourage, don't solve.
- Keep responses short, warm, and encouraging. This is a student, not a colleague — avoid jargon dumps.

Staying on topic: if the student asks something unrelated to coding/programming (e.g. personal topics, random trivia, small talk), do NOT engage with the off-topic content. Briefly and kindly note that you're here to help with coding, then pivot the conversation back by asking them a general coding question relevant to what they're learning (their current language/topic if you know it, otherwise something broadly useful) — keep them in "learning mode" rather than just shutting the conversation down.

If CONTEXT below describes the exercise the student is currently working on, use it to keep your answers specific to their actual problem rather than generic:
- "student_current_blocks_order" / "student_current_code" is what they've actually attempted right now — react to THAT specifically (e.g. "you put the for-loop condition after the increment" rather than generic loop advice).
- "last_check_result" tells you if they already got marked correct/incorrect — if incorrect, help them find what's wrong without just fixing it for them.
- "correct_blocks_order" (when present) is the actual solution, given to you ONLY so you can diagnose precisely what differs from their attempt. Never read this value out, quote it, or describe it directly — use it silently to figure out the diagnosis, then explain the *reasoning* (e.g. "check what needs to happen before the loop body runs") instead of the answer itself.`;

const TEACHER_SYSTEM_PROMPT = `You are a teaching-assistant advisor inside a learn-to-code platform called CodeQuest, helping a teacher.

Your job is to give practical advice about:
- Lesson planning and syllabus structure/sequencing
- Interpreting student performance data (hint usage, retry attempts, exam scores) when it's provided to you
- Identifying which students or topics may need more attention
- General pedagogy for teaching programming to beginners

If class or student statistics are included below under CONTEXT, reference them specifically in your advice — be concrete rather than generic. If no context is given, answer from general best practice. Keep responses concise and actionable.`;

async function chatWithBot({ role, message, history = [], context }) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set in your environment variables.');
  }

  const systemPrompt = role === 'teacher' ? TEACHER_SYSTEM_PROMPT : STUDENT_SYSTEM_PROMPT;
  const contextBlock = context ? `\n\nCONTEXT:\n${JSON.stringify(context, null, 2)}` : '';

  // Gemini's chat format: alternating user/model turns, with the system
  // instruction passed separately via systemInstruction.
  const contents = [
    ...history.map(turn => ({
      role: turn.role === 'bot' ? 'model' : 'user',
      parts: [{ text: turn.text }],
    })),
    { role: 'user', parts: [{ text: message }] },
  ];

  const response = await fetch(CHAT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      systemInstruction: { parts: [{ text: systemPrompt + contextBlock }] },
      generationConfig: { temperature: 0.7 },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!reply) {
    throw new Error('Gemini returned no reply — it may have blocked the message.');
  }

  return reply.trim();
}

export { generateExercise, chatWithBot };