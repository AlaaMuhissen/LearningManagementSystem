import API_URL from '../../config/api.js';
import { useState } from 'react';
import {
  Box, Typography, TextField, Button, IconButton, CircularProgress
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import Editor from '@monaco-editor/react';
import { getAuth } from 'firebase/auth';
import { useAuth } from '../../Components/Login/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LANGUAGES = ['html', 'css', 'javascript', 'python', 'java'];
const LEVELS = [
  { value: 1, label: '🧩 Level 1 — Guided Drag & Drop' },
  { value: 2, label: '🔨 Level 2 — Build Before Run' },
  { value: 3, label: '✍️ Level 3 — Free Coding' },
];
const LEVEL_COLORS = { 1: '#64ffda', 2: '#4fc3f7', 3: '#a78bfa' };

const darkInput = {
  '& .MuiOutlinedInput-root': {
    background: 'rgba(255,255,255,0.04)',
    borderRadius: '12px',
    color: '#fff',
    '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
    '&:hover fieldset': { borderColor: 'rgba(100,255,218,0.3)' },
    '&.Mui-focused fieldset': { borderColor: '#64ffda' },
  },
  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.4)' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#64ffda' },
  '& .MuiInputBase-input': { color: '#fff' },
  '& .MuiFormHelperText-root': { color: 'rgba(255,255,255,0.3)' },
};



const sectionLabel = {
  fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)',
  textTransform: 'uppercase', letterSpacing: 1.2, mb: 1.5, display: 'block',
};

const divider = { height: 1, background: 'rgba(255,255,255,0.06)', my: 3 };

function EditExerciseForm({ exercise, onSaved, onClose }) {
  const [questionText, setQuestionText] = useState(exercise.question_text);
  const [level, setLevel] = useState(exercise.level);
  const [language, setLanguage] = useState(exercise.language);
  const [reward, setReward] = useState(exercise.reward);
  const [blocks, setBlocks] = useState(exercise.blocks?.map(b => b.value) || ['']);
  const [expectedOutput, setExpectedOutput] = useState(exercise.expected_output || '');
  const [testCases, setTestCases] = useState(exercise.test_cases || ['']);
  const [hint, setHint] = useState(exercise.hint || '');
  const [loading, setLoading] = useState(false);
  const auth = getAuth();
  const { authToken, updateUser } = useAuth();

  const refreshIdToken = async () => {
    const user = auth.currentUser;
    if (user) {
      const freshToken = await user.getIdToken(true);
      updateUser({ ...authToken, token: freshToken });
      return freshToken;
    }
  };

  const addBlock = () => setBlocks([...blocks, '']);
  const removeBlock = (i) => setBlocks(blocks.filter((_, idx) => idx !== i));
  const updateBlock = (i, val) => { const u = [...blocks]; u[i] = val; setBlocks(u); };
  const addTestCase = () => setTestCases([...testCases, '']);
  const removeTestCase = (i) => setTestCases(testCases.filter((_, idx) => idx !== i));
  const updateTestCase = (i, val) => { const u = [...testCases]; u[i] = val; setTestCases(u); };

  const handleSave = async () => {
    if (!questionText.trim()) return toast.error('Question text is required', { theme: 'dark' });
    setLoading(true);
    const token = await refreshIdToken();
    try {
      const res = await fetch(`${API_URL}/api/teacher/exercises/${exercise.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_text: questionText, level, language, reward,
          blocks: level <= 2 ? blocks.filter(b => b.trim()) : [],
          hint: hint.trim() || null,
          expected_output: level === 3 && ['html','css'].includes(language) ? expectedOutput : null,
          test_cases: level === 3 && ['javascript','python','java'].includes(language)
            ? testCases.filter(t => t.trim()) : null,
        }),
      });
      if (res.ok) {
        toast.success('Exercise updated!', { theme: 'dark' });
        setTimeout(() => { onSaved(); onClose(); }, 1000);
      } else {
        toast.error('Failed to update', { theme: 'dark' });
      }
    } catch { toast.error('Network error', { theme: 'dark' }); }
    finally { setLoading(false); }
  };

  const isHtmlCss = ['html', 'css'].includes(language);
  const levelColor = LEVEL_COLORS[level] || '#64ffda';

  return (
    <Box sx={{ p: 1 }}>
      <ToastContainer />

      {/* Question */}
      <Typography sx={sectionLabel}>Question</Typography>
      <TextField
        label="Question / Instructions"
        value={questionText}
        onChange={e => setQuestionText(e.target.value)}
        fullWidth required multiline rows={3}
        sx={darkInput}
      />

      <Box sx={divider} />

      {/* Language / Level / Reward */}
      <Typography sx={sectionLabel}>Configuration</Typography>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {/* Language pills */}
        <Box>
          <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', mb: 1 }}>Language</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {LANGUAGES.map(l => (
              <Box
                key={l}
                onClick={() => setLanguage(l)}
                sx={{
                  px: 1.5, py: 0.6, borderRadius: '8px', cursor: 'pointer', fontSize: 12, fontWeight: 700,
                  border: `1px solid ${language === l ? '#64ffda' : 'rgba(255,255,255,0.1)'}`,
                  background: language === l ? 'rgba(100,255,218,0.1)' : 'transparent',
                  color: language === l ? '#64ffda' : 'rgba(255,255,255,0.4)',
                  transition: 'all 0.2s',
                  '&:hover': { borderColor: 'rgba(100,255,218,0.3)', color: '#64ffda' },
                }}
              >
                {l.toUpperCase()}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Level pills */}
        <Box sx={{ flex: 1, minWidth: 260 }}>
          <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', mb: 1 }}>Level</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {LEVELS.map(l => (
              <Box
                key={l.value}
                onClick={() => setLevel(l.value)}
                sx={{
                  px: 1.5, py: 0.6, borderRadius: '8px', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                  border: `1px solid ${level === l.value ? LEVEL_COLORS[l.value] : 'rgba(255,255,255,0.1)'}`,
                  background: level === l.value ? `${LEVEL_COLORS[l.value]}18` : 'transparent',
                  color: level === l.value ? LEVEL_COLORS[l.value] : 'rgba(255,255,255,0.4)',
                  transition: 'all 0.2s',
                  '&:hover': { borderColor: LEVEL_COLORS[l.value], color: LEVEL_COLORS[l.value] },
                }}
              >
                {l.label}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Reward */}
        <Box>
          <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', mb: 1 }}>XP Reward</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1,
            background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.2)',
            borderRadius: '12px', px: 2, py: 0.8,
          }}>
            <span style={{ fontSize: 16 }}>⚡</span>
            <input
              type="number"
              value={reward}
              onChange={e => setReward(parseInt(e.target.value))}
              style={{
                background: 'none', border: 'none', outline: 'none',
                color: '#ffd700', fontWeight: 800, fontSize: 18, width: 60,
              }}
            />
            <Typography sx={{ fontSize: 11, color: 'rgba(255,215,0,0.5)', fontWeight: 600 }}>XP</Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={divider} />

      {/* Blocks — Level 1 & 2 */}
      {level <= 2 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography sx={sectionLabel}>Code Blocks</Typography>
            <Typography sx={{ fontSize: 11, color: levelColor }}>
              {blocks.filter(b => b.trim()).length} blocks
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {blocks.map((block, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{
                  width: 26, height: 26, borderRadius: '8px', flexShrink: 0,
                  background: `${levelColor}18`, border: `1px solid ${levelColor}33`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: levelColor,
                }}>{i + 1}</Box>
                <TextField
                  value={block}
                  onChange={e => updateBlock(i, e.target.value)}
                  placeholder={`Block ${i + 1} — e.g. <h1>`}
                  size="small" fullWidth
                  sx={{
                    ...darkInput,
                    '& .MuiInputBase-input': { fontFamily: "'Fira Code', monospace", fontSize: 13, color: '#64ffda' },
                  }}
                />
                <IconButton onClick={() => removeBlock(i)} size="small"
                  sx={{ color: 'rgba(248,113,113,0.5)', '&:hover': { color: '#f87171', background: 'rgba(248,113,113,0.1)' } }}>
                  <DeleteIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>
            ))}
          </Box>
          <Box
            onClick={addBlock}
            sx={{
              mt: 1.5, display: 'flex', alignItems: 'center', gap: 1,
              color: levelColor, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              opacity: 0.7, '&:hover': { opacity: 1 },
            }}
          >
            <AddCircleOutlineIcon sx={{ fontSize: 18 }} />
            Add Block
          </Box>
        </Box>
      )}

      {/* Level 3 */}
      {level === 3 && (
        <Box>
          <Typography sx={sectionLabel}>
            {isHtmlCss ? 'Expected Output' : 'Test Cases'}
          </Typography>
          {isHtmlCss ? (
            <Box>
              <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', mb: 1.5 }}>
                Write the correct solution — student output will be compared to this
              </Typography>
              <Box sx={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                <Editor
                  height="200px" language={language} theme="vs-dark"
                  value={expectedOutput} onChange={val => setExpectedOutput(val || '')}
                  options={{ fontSize: 13, minimap: { enabled: false }, wordWrap: 'on' }}
                />
              </Box>
              {expectedOutput && (
                <Box sx={{ mt: 2 }}>
                  <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>
                    Preview
                  </Typography>
                  <Box sx={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', bgcolor: '#fff' }}>
                    <iframe title="expected" srcDoc={expectedOutput}
                      style={{ width: '100%', height: 150, border: 'none' }} sandbox="allow-scripts" />
                  </Box>
                </Box>
              )}
            </Box>
          ) : (
            <Box>
              <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', mb: 1.5 }}>
                Add strings that must appear in the output — e.g. for Python print(Hello) → add Hello
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {testCases.map((tc, i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      value={tc} onChange={e => updateTestCase(i, e.target.value)}
                      placeholder={`Expected output ${i + 1}`}
                      size="small" fullWidth sx={darkInput}
                    />
                    <IconButton onClick={() => removeTestCase(i)} size="small"
                      sx={{ color: 'rgba(248,113,113,0.5)', '&:hover': { color: '#f87171', background: 'rgba(248,113,113,0.1)' } }}>
                      <DeleteIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Box>
                ))}
              </Box>
              <Box onClick={addTestCase} sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1, color: '#a78bfa', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: 0.7, '&:hover': { opacity: 1 } }}>
                <AddCircleOutlineIcon sx={{ fontSize: 18 }} /> Add Test Case
              </Box>
            </Box>
          )}
        </Box>
      )}

      <Box sx={divider} />

      {/* Hint */}
      <Typography sx={sectionLabel}>Hint (optional)</Typography>
      <TextField
        label="Hint"
        value={hint}
        onChange={e => setHint(e.target.value)}
        fullWidth multiline rows={2}
        placeholder="e.g. The heading tag starts with h followed by a number..."
        helperText="💡 Students who use the hint earn 70% of the reward points"
        sx={darkInput}
      />

      <Box sx={divider} />

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="contained" onClick={handleSave} disabled={loading}
          sx={{
            background: `linear-gradient(135deg, ${levelColor}, #4fc3f7)`,
            color: '#0b0920', fontWeight: 700, borderRadius: '12px',
            textTransform: 'none', px: 3, minWidth: 140,
            '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 8px 24px ${levelColor}44` },
            transition: 'all 0.2s',
          }}
        >
          {loading ? <CircularProgress size={18} sx={{ color: '#0b0920' }} /> : '💾 Save Changes'}
        </Button>
        <Button onClick={onClose} sx={{
          color: 'rgba(255,255,255,0.4)', borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.1)', textTransform: 'none', px: 3,
          '&:hover': { border: '1px solid rgba(255,255,255,0.25)', color: '#fff' },
        }}>
          Cancel
        </Button>
      </Box>
    </Box>
  );
}

export default EditExerciseForm;