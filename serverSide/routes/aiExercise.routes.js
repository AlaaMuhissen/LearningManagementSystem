// routes/aiExerciseRoutes.js
//
// Mount this in your main server file:
//   import aiExerciseRoutes from './routes/aiExerciseRoutes.js';
//   app.use('/api/ai', aiExerciseRoutes);
//
// Requires GEMINI_API_KEY in your .env (see geminiService.js for setup).

import express from 'express';
import { generateExercise, chatWithBot } from '../services/geminiService.js';

const router = express.Router();

// POST /api/ai/generate-exercise
// body: { language: 'html'|'css'|'javascript'|'python'|'java', level: 1|2|3, topic?: string }
//
// Returns a full exercise object (question_text, blocks, hint, expected_output,
// test_cases, reward). This does NOT save anything to the database — the caller
// decides what to do with it:
//   - TeacherExerciseForm pre-fills its create form with this, teacher reviews/edits/saves
//   - StudentPractice uses it directly as an ephemeral question, checking the
//     student's answer against expected_output/test_cases on the client
router.post('/generate-exercise', async (req, res) => {
  const { language, level, topic } = req.body;

  if (!language || !level) {
    return res.status(400).json({ error: 'language and level are required' });
  }

  try {
    const exercise = await generateExercise({ language, level, topic });
    res.json(exercise);
  } catch (error) {
    console.error('AI exercise generation failed:', error.message);
    res.status(500).json({ error: 'Failed to generate exercise. Please try again.' });
  }
});

// POST /api/ai/chat
// body: { role: 'student'|'teacher', message: string, history?: [{role:'user'|'bot', text}], context?: object }
//
// The robot button uses this for both modes:
//  - student: tutor mode — guides, never hands over the finished solution
//  - teacher: advisor mode — give it { context } with student/syllabus stats
//    (pull from whatever the teacher dashboard already has loaded — no need
//    for this route to query the DB itself) and it'll reference them directly
router.post('/chat', async (req, res) => {
  const { role, message, history, context } = req.body;

  if (!message?.trim()) {
    return res.status(400).json({ error: 'message is required' });
  }

  try {
    const reply = await chatWithBot({ role, message, history, context });
    res.json({ reply });
  } catch (error) {
    console.error('AI chat failed:', error.message);
    res.status(500).json({ error: 'The robot is having trouble responding right now.' });
  }
});

export default router;