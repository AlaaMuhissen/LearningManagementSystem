import API_URL from '../../config/api.js';
import { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, Select, MenuItem,
  FormControl, InputLabel, Chip, CircularProgress,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Editor from '@monaco-editor/react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useActiveExercise } from '../../Components/ActiveExerciseContext';

// ---- Theme tokens (shared with rest of app) ----
const TEAL = '#64ffda';
const BLUE = '#4fc3f7';
const PURPLE = '#a78bfa';

const glassCard = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '16px',
};

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    background: 'rgba(255,255,255,0.02)',
    borderRadius: '10px',
    color: '#e6f1ff',
    '& fieldset': { borderColor: 'rgba(255,255,255,0.12)' },
    '&:hover fieldset': { borderColor: 'rgba(100,255,218,0.4)' },
    '&.Mui-focused fieldset': { borderColor: TEAL },
  },
  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' },
  '& .MuiInputLabel-root.Mui-focused': { color: TEAL },
};

const selectSx = {
  color: '#e6f1ff',
  background: 'rgba(255,255,255,0.02)',
  borderRadius: '10px',
  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.12)' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(100,255,218,0.4)' },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: TEAL },
  '& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.5)' },
};

const menuProps = {
  PaperProps: {
    sx: {
      background: '#131a37',
      border: '1px solid rgba(255,255,255,0.08)',
      '& .MuiMenuItem-root': { color: '#e6f1ff', fontFamily: '"JetBrains Mono", monospace' },
      '& .MuiMenuItem-root:hover': { background: 'rgba(100,255,218,0.08)' },
    },
  },
};

const primaryBtnSx = {
  px: 3, py: 1.1,
  borderRadius: '10px',
  fontWeight: 700,
  fontFamily: '"JetBrains Mono", monospace',
  textTransform: 'none',
  color: '#0d1228',
  background: `linear-gradient(135deg, ${PURPLE}, ${BLUE})`,
  '&:hover': { background: `linear-gradient(135deg, ${BLUE}, ${PURPLE})` },
  '&.Mui-disabled': { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)' },
};

const LANGUAGES = ['html', 'css', 'javascript', 'python', 'java'];
const LEVELS = [
  { value: 1, label: 'Level 1 — Guided' },
  { value: 2, label: 'Level 2 — Build' },
  { value: 3, label: 'Level 3 — Free Code' },
];

// Fisher-Yates shuffle, doesn't mutate the original
function shuffled(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function StudentPractice() {
  const { setActiveExercise, clearActiveExercise } = useActiveExercise();
  const [language, setLanguage] = useState('html');
  const [level, setLevel] = useState(1);
  const [topic, setTopic] = useState('');
  const [generating, setGenerating] = useState(false);

  const [exercise, setExercise] = useState(null); // the generated question
  const [pool, setPool] = useState([]);           // shuffled blocks not yet placed (level 1/2)
  const [placed, setPlaced] = useState([]);        // blocks placed in order (level 1/2)
  const [code, setCode] = useState('');            // student code (level 3)
  const [jsOutput, setJsOutput] = useState('');     // captured console output (level 3 JS)
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [result, setResult] = useState(null); // null | 'correct' | 'incorrect'

  const resetSolvingState = (data) => {
    setPlaced([]);
    setPool(data.level <= 2 ? shuffled(data.blocks) : []);
    setCode('');
    setJsOutput('');
    setShowHint(false);
    setShowSolution(false);
    setResult(null);
  };

  // Tell the globally-mounted robot button what we're working on right now —
  // including the student's CURRENT attempt and whether it was marked correct
  // or not, so the bot can actually react to "why is my answer wrong" instead
  // of only knowing the question text. Updates live as the student interacts,
  // not just once when the question is generated.
  useEffect(() => {
    if (!exercise) return;
    const isBlockLevel = exercise.level <= 2;
    setActiveExercise({
      language: exercise.language,
      level: exercise.level,
      question_text: exercise.question_text,
      hint: exercise.hint,
      exercise_type: isBlockLevel ? 'drag-and-drop blocks' : 'free code editor',
      // The AI needs the correct answer to give targeted help, but its system
      // prompt instructs it to never just hand this over to the student —
      // only to use it to identify what's specifically wrong with their attempt.
      correct_blocks_order: isBlockLevel ? exercise.blocks : undefined,
      student_current_blocks_order: isBlockLevel ? placed : undefined,
      student_current_code: !isBlockLevel ? code : undefined,
      code_run_output: !isBlockLevel ? jsOutput : undefined,
      last_check_result: result, // 'correct' | 'incorrect' | null (not checked yet)
    });
    return () => clearActiveExercise();
  }, [exercise, placed, code, jsOutput, result]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`${API_URL}/api/ai/generate-exercise`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, level, topic: topic.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.error || 'Could not generate a question');
      setExercise(data);
      resetSolvingState(data);
    } catch (error) {
      toast.error('Could not reach the AI service');
    } finally {
      setGenerating(false);
    }
  };

  // ---- Level 1/2: click-to-arrange ----
  const placeBlock = (index) => {
    if (result === 'correct') return;
    const block = pool[index];
    setPool(pool.filter((_, i) => i !== index));
    setPlaced([...placed, block]);
    setResult(null);
  };
  const returnBlock = (index) => {
    if (result === 'correct') return;
    const block = placed[index];
    setPlaced(placed.filter((_, i) => i !== index));
    setPool([...pool, block]);
    setResult(null);
  };
  const checkBlocksAnswer = () => {
    const correct = JSON.stringify(placed) === JSON.stringify(exercise.blocks);
    setResult(correct ? 'correct' : 'incorrect');
    if (correct) toast.success('Correct! 🎉');
  };

  // ---- Level 3: run/check ----
  const runAndCheck = () => {
    if (['html', 'css'].includes(language)) {
      const normalize = s => s.replace(/\s+/g, ' ').trim().toLowerCase();
      const correct = normalize(code) === normalize(exercise.expected_output || '');
      setResult(correct ? 'correct' : 'incorrect');
      if (correct) toast.success('Correct! 🎉');
      return;
    }

    if (language === 'javascript') {
      let captured = [];
      const fakeConsole = { log: (...args) => captured.push(args.map(String).join(' ')) };
      try {
        // eslint-disable-next-line no-new-func
        const fn = new Function('console', code);
        fn(fakeConsole);
      } catch (err) {
        setJsOutput(`Error: ${err.message}`);
        setResult('incorrect');
        return;
      }
      const outputText = captured.join('\n');
      setJsOutput(outputText || '(no output)');
      const cases = exercise.test_cases || [];
      const correct = cases.length > 0 && cases.every(tc => outputText.includes(tc));
      setResult(correct ? 'correct' : 'incorrect');
      if (correct) toast.success('Correct! 🎉');
      return;
    }

    // Python / Java — no client-side execution available.
    toast.info("Python and Java can't run in the browser — compare your output against the test cases below, or reveal the solution.");
  };

  const canAutoCheck = ['html', 'css', 'javascript'].includes(language);

  return (
    <Box sx={{ maxWidth: 820, mx: 'auto' }}>
      <ToastContainer theme="dark" />

      {/* Setup panel */}
      <Box sx={{ ...glassCard, p: { xs: 2.5, sm: 3 }, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <AutoAwesomeIcon sx={{ fontSize: 20, color: PURPLE }} />
          <Typography sx={{ fontSize: '1.15rem', fontWeight: 700, color: '#e6f1ff' }}>
            Practice with AI
          </Typography>
        </Box>
        <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', mb: 2.5 }}>
          Generate a fresh practice question anytime — as many as you want, no waiting for a teacher to assign one.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel sx={{ color: 'rgba(255,255,255,0.5)', '&.Mui-focused': { color: TEAL } }}>Language</InputLabel>
            <Select value={language} onChange={e => setLanguage(e.target.value)} label="Language" sx={selectSx} MenuProps={menuProps}>
              {LANGUAGES.map(l => <MenuItem key={l} value={l}>{l.toUpperCase()}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 190 }}>
            <InputLabel sx={{ color: 'rgba(255,255,255,0.5)', '&.Mui-focused': { color: TEAL } }}>Level</InputLabel>
            <Select value={level} onChange={e => setLevel(e.target.value)} label="Level" sx={selectSx} MenuProps={menuProps}>
              {LEVELS.map(l => <MenuItem key={l.value} value={l.value}>{l.label}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="Optional topic (e.g. loops, flexbox)"
            size="small"
            sx={{ flex: 1, minWidth: 200, ...fieldSx }}
          />
          <Button
            onClick={handleGenerate}
            disabled={generating}
            startIcon={generating ? null : (exercise ? <RefreshIcon sx={{ fontSize: 17 }} /> : <AutoAwesomeIcon sx={{ fontSize: 17 }} />)}
            sx={primaryBtnSx}
          >
            {generating ? 'Generating...' : exercise ? 'New Question' : 'Generate'}
          </Button>
        </Box>
      </Box>

      {/* Question panel */}
      {generating && !exercise && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress sx={{ color: PURPLE }} />
        </Box>
      )}

      {exercise && (
        <Box sx={{ ...glassCard, p: { xs: 2.5, sm: 3.5 } }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1.5, flexWrap: 'wrap' }}>
            <Chip
              label={`${language.toUpperCase()} · Level ${level}`}
              size="small"
              sx={{ background: 'rgba(100,255,218,0.1)', color: TEAL, fontFamily: '"JetBrains Mono", monospace', border: '1px solid rgba(100,255,218,0.25)' }}
            />
            {result === 'correct' && (
              <Chip icon={<CheckCircleIcon sx={{ fontSize: 16, color: '#0d1228 !important' }} />} label="Correct" size="small" sx={{ background: '#22c55e', color: '#0d1228', fontWeight: 700 }} />
            )}
            {result === 'incorrect' && (
              <Chip icon={<CancelIcon sx={{ fontSize: 16, color: '#fff !important' }} />} label="Not quite" size="small" sx={{ background: '#ef4444', color: '#fff', fontWeight: 700 }} />
            )}
          </Box>

          <Typography sx={{ color: '#e6f1ff', fontSize: '1.05rem', mb: 3 }}>
            {exercise.question_text}
          </Typography>

          {/* Level 1/2 — click to arrange */}
          {level <= 2 && (
            <Box>
              <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1 }}>
                Your answer — click blocks below to add them here, in order
              </Typography>
              <Box sx={{
                display: 'flex', flexWrap: 'wrap', gap: 1, minHeight: 52, p: 1.5, mb: 2,
                borderRadius: '10px', border: '1px dashed rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.02)',
              }}>
                {placed.length === 0 && (
                  <Typography sx={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                    Nothing placed yet
                  </Typography>
                )}
                {placed.map((block, i) => (
                  <Chip
                    key={i}
                    label={block}
                    onClick={() => returnBlock(i)}
                    sx={{
                      cursor: 'pointer', fontFamily: '"JetBrains Mono", monospace', fontSize: '0.8rem',
                      background: `${BLUE}22`, color: BLUE, border: `1px solid ${BLUE}55`,
                    }}
                  />
                ))}
              </Box>

              <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1 }}>
                Available blocks
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                {pool.map((block, i) => (
                  <Chip
                    key={i}
                    label={block}
                    onClick={() => placeBlock(i)}
                    sx={{
                      cursor: 'pointer', fontFamily: '"JetBrains Mono", monospace', fontSize: '0.8rem',
                      background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.8)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      '&:hover': { borderColor: TEAL, color: TEAL },
                    }}
                  />
                ))}
                {pool.length === 0 && placed.length > 0 && (
                  <Typography sx={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.8rem' }}>All blocks placed</Typography>
                )}
              </Box>

              <Button
                onClick={checkBlocksAnswer}
                disabled={pool.length > 0 || result === 'correct'}
                sx={primaryBtnSx}
              >
                Check Answer
              </Button>
            </Box>
          )}

          {/* Level 3 — free code */}
          {level === 3 && (
            <Box>
              <Box sx={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', mb: 2 }}>
                <Editor
                  height="220px"
                  language={language}
                  theme="vs-dark"
                  value={code}
                  onChange={val => setCode(val || '')}
                  options={{ fontSize: 13, minimap: { enabled: false }, wordWrap: 'on' }}
                />
              </Box>

              {['html', 'css'].includes(language) && code && (
                <Box sx={{ mb: 2 }}>
                  <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', mb: 0.5 }}>Preview</Typography>
                  <Box sx={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', bgcolor: '#fff' }}>
                    <iframe title="preview" srcDoc={code} style={{ width: '100%', height: 150, border: 'none' }} sandbox="allow-scripts" />
                  </Box>
                </Box>
              )}

              {language === 'javascript' && jsOutput && (
                <Box sx={{ mb: 2, p: 1.5, borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem', mb: 0.5 }}>Console output</Typography>
                  <Typography sx={{ color: TEAL, fontFamily: '"JetBrains Mono", monospace', fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>
                    {jsOutput}
                  </Typography>
                </Box>
              )}

              {!canAutoCheck && (
                <Box sx={{ mb: 2, p: 1.5, borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem', mb: 0.5 }}>
                    Expected output should contain
                  </Typography>
                  {(exercise.test_cases || []).map((tc, i) => (
                    <Chip key={i} label={tc} size="small" sx={{ mr: 0.5, mb: 0.5, fontFamily: '"JetBrains Mono", monospace', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)' }} />
                  ))}
                </Box>
              )}

              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                <Button onClick={runAndCheck} sx={primaryBtnSx}>
                  {canAutoCheck ? 'Run & Check' : 'Run'}
                </Button>
                <Button
                  onClick={() => setShowSolution(!showSolution)}
                  startIcon={<VisibilityIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    textTransform: 'none', fontFamily: '"JetBrains Mono", monospace',
                    color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px',
                    '&:hover': { background: 'rgba(255,255,255,0.05)' },
                  }}
                >
                  {showSolution ? 'Hide Solution' : 'Reveal Solution'}
                </Button>
              </Box>

              {showSolution && (
                <Box sx={{ mt: 2, borderRadius: '10px', overflow: 'hidden', border: `1px solid ${PURPLE}44` }}>
                  <Editor
                    height="160px"
                    language={language}
                    theme="vs-dark"
                    value={exercise.example_solution || '(no example solution returned)'}
                    options={{ fontSize: 13, minimap: { enabled: false }, wordWrap: 'on', readOnly: true }}
                  />
                </Box>
              )}
            </Box>
          )}

          {/* Hint */}
          {exercise.hint && (
            <Box sx={{ mt: 3 }}>
              <Button
                onClick={() => setShowHint(!showHint)}
                size="small"
                sx={{ textTransform: 'none', color: BLUE, fontFamily: '"JetBrains Mono", monospace', fontSize: '0.8rem' }}
              >
                {showHint ? 'Hide hint' : '💡 Need a hint?'}
              </Button>
              {showHint && (
                <Typography sx={{ mt: 1, color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                  {exercise.hint}
                </Typography>
              )}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}