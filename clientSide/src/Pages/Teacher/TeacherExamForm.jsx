import API_URL from '../../config/api.js';
import { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, Divider,
  Chip, FormControlLabel, Switch, CircularProgress
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PublishIcon from '@mui/icons-material/Publish';
import SaveIcon from '@mui/icons-material/Save';
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

const switchSx = {
  '& .MuiSwitch-switchBase.Mui-checked': { color: TEAL },
  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: TEAL },
};

function chipSx(active, color = TEAL) {
  return {
    cursor: 'pointer',
    borderRadius: '8px',
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: '0.8rem',
    color: active ? '#0d1228' : 'rgba(255,255,255,0.75)',
    background: active ? color : 'rgba(255,255,255,0.04)',
    border: `1px solid ${active ? color : 'rgba(255,255,255,0.12)'}`,
    fontWeight: active ? 700 : 400,
    transition: 'all 0.15s ease',
    '&:hover': {
      background: active ? color : 'rgba(255,255,255,0.08)',
      borderColor: color,
    },
  };
}

function TeacherExamForm({ onCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timeLimit, setTimeLimit] = useState('');
  const [noTimeLimit, setNoTimeLimit] = useState(false);
  const [exercises, setExercises] = useState([]);
  const [selectedExerciseIds, setSelectedExerciseIds] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [publishNow, setPublishNow] = useState(false);
  const [deadline, setDeadline] = useState('');
  const [allowRetry, setAllowRetry] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await refreshIdToken();
        const [exRes, stRes] = await Promise.all([
          fetch(`${API_URL}/api/teacher/exercises/${userData.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${API_URL}/api/teacher/students/${userData.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
        ]);
        const exData = await exRes.json();
        const stData = await stRes.json();
        setExercises(Array.isArray(exData) ? exData : []);
        setStudents(Array.isArray(stData) ? stData : []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoadingData(false);
      }
    };
    if (userData?.id) fetchData();
  }, [userData?.id]);

  const handleExerciseToggle = (id) => {
    setSelectedExerciseIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleStudentToggle = (id) => {
    setSelectedStudentIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return toast.error('Title is required');
    if (selectedExerciseIds.length === 0) return toast.error('Select at least one exercise');
    if (publishNow && selectedStudentIds.length === 0) return toast.error('Select at least one student to publish to');

    setLoading(true);
    const token = await refreshIdToken();

    try {
      // Create exam
      const res = await fetch(`${API_URL}/api/teacher/exams`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacher_id: userData.id,
          title,
          description,
          time_limit: noTimeLimit ? null : parseInt(timeLimit) || null,
          deadline: deadline || null,
          allow_retry: allowRetry,
          exercise_ids: selectedExerciseIds,
        }),
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.error || 'Failed to create exam');

      const exam_id = data.exam_id;

      // Publish to students if requested
      if (publishNow && selectedStudentIds.length > 0) {
        await fetch(`${API_URL}/api/teacher/exams/${exam_id}/publish`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ student_ids: selectedStudentIds }),
        });
      }

      toast.success(publishNow ? 'Exam created and published!' : 'Exam created!');
      setTitle('');
      setDescription('');
      setTimeLimit('');
      setSelectedExerciseIds([]);
      setSelectedStudentIds([]);
      setPublishNow(false);
      if (onCreated) onCreated();
    } catch (error) {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <Box sx={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        minHeight: '300px', background: BG,
      }}>
        <CircularProgress sx={{ color: TEAL }} />
      </Box>
    );
  }

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
            Create New Exam
          </Typography>
        </Box>
        <Typography sx={{ color: 'rgba(255,255,255,0.45)', ml: 2.5, mb: 3, fontSize: '0.9rem' }}>
          Assemble exercises into a timed exam and publish it to your students.
        </Typography>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.07)', mb: 3 }} />

        {/* Basic info */}
        <Typography sx={sectionLabel}>Details</Typography>
        <TextField
          label="Exam Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          fullWidth required margin="normal"
          placeholder="e.g. HTML Basics Mid-term"
          sx={fieldSx}
        />
        <TextField
          label="Description (optional)"
          value={description}
          onChange={e => setDescription(e.target.value)}
          fullWidth multiline rows={2} margin="normal"
          sx={fieldSx}
        />

        {/* Time limit */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Time Limit (minutes)"
            type="number"
            value={timeLimit}
            onChange={e => setTimeLimit(e.target.value)}
            disabled={noTimeLimit}
            sx={{ width: 200, ...fieldSx }}
          />
          <FormControlLabel
            control={<Switch checked={noTimeLimit} onChange={e => setNoTimeLimit(e.target.checked)} sx={switchSx} />}
            label="No time limit"
            sx={{ color: 'rgba(255,255,255,0.7)' }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center', mt: 2 }}>
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
            label="Allow students to retry exam"
            sx={{ color: 'rgba(255,255,255,0.7)' }}
          />
        </Box>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.07)', my: 3 }} />

        {/* Exercise selection */}
        <Typography sx={sectionLabel}>Select Exercises</Typography>
        {exercises.length === 0 ? (
          <Typography sx={{ color: 'rgba(255,255,255,0.4)' }}>
            No exercises yet — create some first.
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {exercises.map(ex => {
              const active = selectedExerciseIds.includes(ex.id);
              return (
                <Chip
                  key={ex.id}
                  icon={active ? <CheckCircleIcon sx={{ fontSize: 16, color: '#0d1228 !important' }} /> : undefined}
                  label={`${ex.language.toUpperCase()} L${ex.level} — ${ex.question_text.slice(0, 40)}...`}
                  onClick={() => handleExerciseToggle(ex.id)}
                  sx={chipSx(active, TEAL)}
                />
              );
            })}
          </Box>
        )}

        <Typography sx={{ mt: 1.5, display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', fontFamily: '"JetBrains Mono", monospace' }}>
          {selectedExerciseIds.length} exercise(s) selected — will appear in this order
        </Typography>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.07)', my: 3 }} />

        {/* Publish toggle */}
        <FormControlLabel
          control={<Switch checked={publishNow} onChange={e => setPublishNow(e.target.checked)} sx={switchSx} />}
          label="Publish to students now"
          sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}
        />

        {/* Student selection — only if publishNow */}
        {publishNow && (
          <Box sx={{ mt: 2 }}>
            <Typography sx={sectionLabel}>Select Students</Typography>
            {students.length === 0 ? (
              <Typography sx={{ color: 'rgba(255,255,255,0.4)' }}>
                No students yet — share your join code first.
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {students.map(st => {
                  const active = selectedStudentIds.includes(st.id);
                  return (
                    <Chip
                      key={st.id}
                      icon={active ? <CheckCircleIcon sx={{ fontSize: 16, color: '#0d1228 !important' }} /> : undefined}
                      label={st.username}
                      onClick={() => handleStudentToggle(st.id)}
                      sx={chipSx(active, PURPLE)}
                    />
                  );
                })}
                <Chip
                  label="Select All"
                  onClick={() => setSelectedStudentIds(students.map(s => s.id))}
                  sx={{
                    cursor: 'pointer',
                    borderRadius: '8px',
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '0.8rem',
                    color: BLUE,
                    background: 'rgba(79,195,247,0.08)',
                    border: `1px solid rgba(79,195,247,0.35)`,
                    '&:hover': { background: 'rgba(79,195,247,0.16)' },
                  }}
                />
              </Box>
            )}
          </Box>
        )}

        <Button
          type="submit"
          disabled={loading}
          startIcon={loading ? null : (publishNow ? <PublishIcon /> : <SaveIcon />)}
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
          {loading ? (
            <>
              <CircularProgress size={18} sx={{ color: 'rgba(255,255,255,0.6)', mr: 1.5 }} />
              Creating...
            </>
          ) : publishNow ? 'Create & Publish Exam' : 'Create Exam'}
        </Button>
      </Box>
    </Box>
  );
}

export default TeacherExamForm;