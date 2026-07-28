import API_URL from '../../config/api.js';
import { useState } from 'react';
import {
  Box, Typography, TextField, Button, Divider,
  Select, MenuItem, FormControl, InputLabel, Chip, IconButton,
  Switch, FormControlLabel
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import Editor from '@monaco-editor/react';
import { getAuth } from 'firebase/auth';
import { useAuth } from '../../Components/Login/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// ---- Theme tokens (shared with rest of app) ----
const TEAL = '#64ffda';
const BLUE = '#4fc3f7';
const PURPLE = '#a78bfa';
const BG = '#0d1228';

const glassCard = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '16px',
  backdropFilter: 'blur(6px)',
};

const sectionLabel = {
  color: TEAL,
  fontFamily: '"JetBrains Mono", monospace',
  fontSize: '0.75rem',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  mb: 1.5,
  display: 'block',
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
  '& .MuiFormHelperText-root': { color: 'rgba(255,255,255,0.4)' },
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
      '& .MuiMenuItem-root': { color: '#e6f1ff', fontFamily: '"JetBrains Mono", monospace', fontSize: '0.9rem' },
      '& .MuiMenuItem-root:hover': { background: 'rgba(100,255,218,0.08)' },
      '& .MuiMenuItem-root.Mui-selected': { background: 'rgba(100,255,218,0.12)' },
    },
  },
};

const switchSx = {
  '& .MuiSwitch-switchBase.Mui-checked': { color: TEAL },
  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: TEAL },
};

const blockChipSx = {
  minWidth: 32,
  background: 'rgba(100,255,218,0.1)',
  color: TEAL,
  fontFamily: '"JetBrains Mono", monospace',
  fontWeight: 700,
  border: '1px solid rgba(100,255,218,0.25)',
};

const monoFieldSx = {
  ...fieldSx,
  '& .MuiOutlinedInput-input': { fontFamily: '"JetBrains Mono", monospace', fontSize: '0.9rem' },
};

const LANGUAGES = ['html', 'css', 'javascript', 'python', 'java'];
const LEVELS = [
  { value: 1, label: 'Level 1 — Guided Drag & Drop' },
  { value: 2, label: 'Level 2 — Build Before Run' },
  { value: 3, label: 'Level 3 — Free Coding' },
];

function TeacherExerciseForm({ onCreated }) {
  const [questionText, setQuestionText] = useState('');
  const [level, setLevel] = useState(1);
  const [language, setLanguage] = useState('html');
  const [reward, setReward] = useState(5);
  const [blocks, setBlocks] = useState(['']);
  const [freeCode, setFreeCode] = useState('<!-- Write example solution here -->');
  const [hint, setHint] = useState('');
  const [deadline, setDeadline] = useState('');
  const [allowRetry, setAllowRetry] = useState(true);
  const [loading, setLoading] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const auth = getAuth();
  const { userData, authToken, updateUser } = useAuth();

  const refreshIdToken = async () => {
    const user = auth.currentUser;
    if (user) {
      const freshToken = await user.getIdToken(true);
      updateUser({ ...authToken, token: freshToken });
      return freshToken;
    }
  };

  const addBlock = () => setBlocks([...blocks, '']);
  const removeBlock = (index) => setBlocks(blocks.filter((_, i) => i !== index));
  const updateBlock = (index, value) => {
    const updated = [...blocks];
    updated[index] = value;
    setBlocks(updated);
  };

  const handleGenerateAI = async () => {
    setAiLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/ai/generate-exercise`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, level, topic: aiTopic.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        return toast.error(data.error || 'AI generation failed');
      }

      // Pre-fill — teacher reviews and edits before saving, nothing is submitted automatically
      setQuestionText(data.question_text || '');
      setHint(data.hint || '');
      if (data.reward) setReward(data.reward);
      if (level <= 2) {
        setBlocks(data.blocks?.length ? data.blocks : ['']);
      } else {
        setFreeCode(data.example_solution || freeCode);
      }
      toast.success('Generated! Review and edit before saving.');
    } catch (error) {
      toast.error('Could not reach the AI service');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!questionText.trim()) return toast.error('Question text is required');
    if (level <= 2 && blocks.filter(b => b.trim()).length === 0) {
      return toast.error('Add at least one code block for level 1 or 2');
    }

    setLoading(true);
    const token = await refreshIdToken();
    const payload = {
      teacher_id: userData.id,
      question_text: questionText,
      level,
      language,
      reward,
      blocks: level <= 2 ? blocks.filter(b => b.trim()) : [],
      hint: hint.trim() || null,
      deadline: deadline || null,
      allow_retry: allowRetry,
    };

    try {
      const res = await fetch(`${API_URL}/api/teacher/exercises`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Exercise created successfully!');
        setQuestionText('');
        setBlocks(['']);
        setFreeCode('<!-- Write example solution here -->');
        if (onCreated) onCreated();
      } else {
        toast.error(data.error || 'Failed to create exercise');
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ p: { xs: 2, sm: 3 }, background: BG, minHeight: '100%' }}
    >
      <ToastContainer theme="dark" />
      <Box sx={{ ...glassCard, p: { xs: 2.5, sm: 4 }, maxWidth: 820, mx: 'auto' }}>

        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <Box sx={{
            width: 4, height: 28, borderRadius: '2px',
            background: `linear-gradient(180deg, ${TEAL}, ${BLUE})`,
          }} />
          <Typography variant="h5" sx={{ color: '#e6f1ff', fontWeight: 700 }}>
            Create New Exercise
          </Typography>
        </Box>
        <Typography sx={{ color: 'rgba(255,255,255,0.45)', ml: 2.5, mb: 3, fontSize: '0.9rem' }}>
          Build a single coding challenge — drag-and-drop, guided build, or free code.
        </Typography>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.07)', mb: 3 }} />

        {/* AI generation panel */}
        <Box sx={{
          mb: 3, p: 2.5, borderRadius: '12px',
          background: `linear-gradient(135deg, ${PURPLE}14, ${BLUE}0a)`,
          border: `1px solid ${PURPLE}33`,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <AutoAwesomeIcon sx={{ fontSize: 18, color: PURPLE }} />
            <Typography sx={{ color: PURPLE, fontWeight: 700, fontSize: '0.85rem' }}>
              Generate with AI
            </Typography>
          </Box>
          <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', mb: 2 }}>
            Uses the Language and Level selected below. Fills in the question, blocks/solution, and hint — review before saving.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <TextField
              value={aiTopic}
              onChange={e => setAiTopic(e.target.value)}
              placeholder="Optional topic focus (e.g. loops, flexbox)"
              size="small"
              sx={{ flex: 1, minWidth: 220, ...fieldSx }}
            />
            <Button
              onClick={handleGenerateAI}
              disabled={aiLoading}
              startIcon={aiLoading ? null : <AutoAwesomeIcon sx={{ fontSize: 16 }} />}
              sx={{
                px: 2.5,
                borderRadius: '10px',
                fontWeight: 700,
                fontFamily: '"JetBrains Mono", monospace',
                textTransform: 'none',
                color: '#0d1228',
                background: `linear-gradient(135deg, ${PURPLE}, ${BLUE})`,
                '&:hover': { background: `linear-gradient(135deg, ${BLUE}, ${PURPLE})` },
                '&.Mui-disabled': { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)' },
              }}
            >
              {aiLoading ? 'Generating...' : 'Generate'}
            </Button>
          </Box>
        </Box>

        {/* Question */}
        <Typography sx={sectionLabel}>Details</Typography>
        <TextField
          label="Question / Instructions"
          value={questionText}
          onChange={e => setQuestionText(e.target.value)}
          fullWidth required multiline rows={3}
          margin="normal"
          placeholder="e.g. Create a main heading that says Hello World"
          sx={fieldSx}
        />

        {/* Language & Level & Reward */}
        <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
          <FormControl sx={{ minWidth: 160 }}>
            <InputLabel sx={{ color: 'rgba(255,255,255,0.5)', '&.Mui-focused': { color: TEAL } }}>
              Language
            </InputLabel>
            <Select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              label="Language"
              sx={selectSx}
              MenuProps={menuProps}
            >
              {LANGUAGES.map(l => (
                <MenuItem key={l} value={l}>{l.toUpperCase()}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 260 }}>
            <InputLabel sx={{ color: 'rgba(255,255,255,0.5)', '&.Mui-focused': { color: TEAL } }}>
              Level
            </InputLabel>
            <Select
              value={level}
              onChange={e => setLevel(e.target.value)}
              label="Level"
              sx={selectSx}
              MenuProps={menuProps}
            >
              {LEVELS.map(l => (
                <MenuItem key={l.value} value={l.value}>{l.label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Reward (points)"
            type="number"
            value={reward}
            onChange={e => setReward(parseInt(e.target.value))}
            sx={{ width: 140, ...fieldSx }}
          />
        </Box>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.07)', my: 3 }} />

        {/* Level 1 & 2 — Block builder */}
        {level <= 2 && (
          <Box>
            <Typography sx={sectionLabel}>
              Code Blocks
              <Box component="span" sx={{
                ml: 1.5, color: 'rgba(255,255,255,0.35)', textTransform: 'none',
                letterSpacing: 'normal', fontWeight: 400,
              }}>
                {level === 1 ? '(Student drags into correct position)' : '(Student arranges in any order)'}
              </Box>
            </Typography>

            {blocks.map((block, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Chip label={index + 1} size="small" sx={blockChipSx} />
                <TextField
                  value={block}
                  onChange={e => updateBlock(index, e.target.value)}
                  placeholder={`Block ${index + 1} (e.g. <h1>)`}
                  size="small"
                  fullWidth
                  sx={monoFieldSx}
                />
                <IconButton
                  onClick={() => removeBlock(index)}
                  size="small"
                  sx={{ color: '#ff6b81', '&:hover': { background: 'rgba(255,107,129,0.1)' } }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}

            <Button
              startIcon={<AddCircleOutlineIcon />}
              onClick={addBlock}
              size="small"
              sx={{
                mt: 1,
                textTransform: 'none',
                fontFamily: '"JetBrains Mono", monospace',
                color: TEAL,
                border: '1px solid rgba(100,255,218,0.3)',
                borderRadius: '8px',
                '&:hover': { background: 'rgba(100,255,218,0.08)', borderColor: TEAL },
              }}
            >
              Add Block
            </Button>

            {blocks.some(b => b.trim()) && (
              <Box sx={{ mt: 2 }}>
                <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', fontFamily: '"JetBrains Mono", monospace', mb: 0.5 }}>
                  Preview order
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {blocks.filter(b => b.trim()).map((b, i) => (
                    <Chip
                      key={i}
                      label={b}
                      size="small"
                      sx={{
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: '0.75rem',
                        background: 'rgba(79,195,247,0.1)',
                        color: BLUE,
                        border: '1px solid rgba(79,195,247,0.25)',
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        )}

        {/* Level 3 — Free coding example solution */}
        {level === 3 && (
          <Box>
            <Typography sx={sectionLabel}>
              Example Solution
              <Box component="span" sx={{
                ml: 1.5, color: 'rgba(255,255,255,0.35)', textTransform: 'none',
                letterSpacing: 'normal', fontWeight: 400,
              }}>
                (For your reference only — not shown to students)
              </Box>
            </Typography>
            <Box sx={{
              borderRadius: '10px', overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
              <Editor
                height="250px"
                language={language === 'html' ? 'html' : language}
                theme="vs-dark"
                value={freeCode}
                onChange={val => setFreeCode(val || '')}
                options={{ fontSize: 13, minimap: { enabled: false }, wordWrap: 'on' }}
              />
            </Box>
          </Box>
        )}

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.07)', my: 3 }} />
        <Typography sx={sectionLabel}>Hint</Typography>
        <TextField
          label="Hint (optional)"
          value={hint}
          onChange={e => setHint(e.target.value)}
          fullWidth
          multiline
          rows={2}
          margin="normal"
          placeholder="e.g. The heading tag starts with h followed by a number..."
          helperText="Students who use the hint will earn 70% of the reward points"
          sx={fieldSx}
        />

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.07)', my: 3 }} />
        <Typography sx={sectionLabel}>Settings</Typography>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            label="Deadline (optional)"
            type="datetime-local"
            value={deadline}
            onChange={e => setDeadline(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 220, ...fieldSx }}
            helperText="Leave empty for no deadline"
          />
          <FormControlLabel
            control={<Switch checked={allowRetry} onChange={e => setAllowRetry(e.target.checked)} sx={switchSx} />}
            label="Allow students to retry"
            sx={{ color: 'rgba(255,255,255,0.7)' }}
          />
        </Box>

        <Button
          type="submit"
          disabled={loading}
          startIcon={loading ? null : <SaveIcon />}
          sx={{
            mt: 4,
            px: 3, py: 1.2,
            borderRadius: '10px',
            fontWeight: 700,
            fontFamily: '"JetBrains Mono", monospace',
            textTransform: 'none',
            color: '#0d1228',
            background: `linear-gradient(135deg, ${TEAL}, ${BLUE})`,
            boxShadow: '0 0 20px rgba(100,255,218,0.25)',
            '&:hover': {
              background: `linear-gradient(135deg, ${BLUE}, ${TEAL})`,
              boxShadow: '0 0 28px rgba(100,255,218,0.4)',
            },
            '&.Mui-disabled': {
              background: 'rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.3)',
            },
          }}
        >
          {loading ? 'Creating...' : 'Create Exercise'}
        </Button>
      </Box>
    </Box>
  );
}

export default TeacherExerciseForm;