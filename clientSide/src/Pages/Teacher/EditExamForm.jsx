import API_URL from '../../config/api.js';
import { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, FormControlLabel, Switch, CircularProgress } from '@mui/material';
import { getAuth } from 'firebase/auth';
import { useAuth } from '../../Components/Login/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
};

const darkSwitch = {
  '& .MuiSwitch-switchBase.Mui-checked': { color: '#64ffda' },
  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#64ffda' },
};

const sectionLabel = {
  fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)',
  textTransform: 'uppercase', letterSpacing: 1.2, mb: 1.5,
};

const divider = {
  height: 1, background: 'rgba(255,255,255,0.06)', my: 3,
};

function ExerciseChip({ ex, selected, onToggle }) {
  return (
    <Box
      onClick={() => onToggle(ex.id)}
      sx={{
        px: 1.5, py: 0.8, borderRadius: '10px', cursor: 'pointer',
        border: `1px solid ${selected ? 'rgba(100,255,218,0.35)' : 'rgba(255,255,255,0.08)'}`,
        background: selected ? 'rgba(100,255,218,0.08)' : 'transparent',
        transition: 'all 0.2s',
        '&:hover': { border: '1px solid rgba(100,255,218,0.25)', background: 'rgba(100,255,218,0.05)' },
      }}
    >
      <Typography sx={{ fontSize: 12, fontWeight: 600, color: selected ? '#64ffda' : 'rgba(255,255,255,0.5)', lineHeight: 1.3 }}>
        <span style={{ color: selected ? '#64ffda' : '#4fc3f7', fontWeight: 700 }}>
          {ex.language?.toUpperCase()} L{ex.level}
        </span>
        {' — '}{ex.question_text?.slice(0, 35)}...
      </Typography>
    </Box>
  );
}

function EditExamForm({ exam, onSaved, onClose }) {
  const [title, setTitle] = useState(exam.title);
  const [description, setDescription] = useState(exam.description || '');
  const [timeLimit, setTimeLimit] = useState(exam.time_limit || '');
  const [noTimeLimit, setNoTimeLimit] = useState(!exam.time_limit);
  const [deadline, setDeadline] = useState(
    exam.deadline ? new Date(exam.deadline).toISOString().slice(0, 16) : ''
  );
  const [allowRetry, setAllowRetry] = useState(exam.allow_retry ?? false);
  const [exercises, setExercises] = useState([]);
  const [selectedExerciseIds, setSelectedExerciseIds] = useState(exam.exercises?.map(e => e.id) || []);
  const [loading, setLoading] = useState(false);
  const [loadingEx, setLoadingEx] = useState(true);
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
    const fetchExercises = async () => {
      const token = await refreshIdToken();
      const res = await fetch(`${API_URL}/api/teacher/exercises/${userData.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setExercises(Array.isArray(data) ? data : []);
      setLoadingEx(false);
    };
    if (userData?.id) fetchExercises();
  }, [userData?.id]);

  const toggleExercise = (id) => {
    setSelectedExerciseIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!title.trim()) return toast.error('Title is required');
    if (selectedExerciseIds.length === 0) return toast.error('Select at least one exercise');
    setLoading(true);
    const token = await refreshIdToken();
    try {
      const res = await fetch(`${API_URL}/api/teacher/exams/${exam.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, description,
          time_limit: noTimeLimit ? null : parseInt(timeLimit) || null,
          deadline: deadline || null,
          allow_retry: allowRetry,
          exercise_ids: selectedExerciseIds,
        }),
      });
      if (res.ok) {
        toast.success('Exam updated!', { theme: 'dark' });
        setTimeout(() => { onSaved(); onClose(); }, 1000);
      } else {
        toast.error('Failed to update exam', { theme: 'dark' });
      }
    } catch {
      toast.error('Network error', { theme: 'dark' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 1 }}>
      <ToastContainer />

      {/* Title & Description */}
      <Typography sx={sectionLabel}>Exam Info</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField label="Title" value={title} onChange={e => setTitle(e.target.value)} fullWidth required sx={darkInput} />
        <TextField label="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} fullWidth multiline rows={2} sx={darkInput} />
      </Box>

      <Box sx={divider} />

      {/* Time & Deadline */}
      <Typography sx={sectionLabel}>Settings</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
        <TextField
          label="Time Limit (minutes)"
          type="number"
          value={timeLimit}
          onChange={e => setTimeLimit(e.target.value)}
          disabled={noTimeLimit}
          sx={{ ...darkInput, width: 200 }}
        />
        <FormControlLabel
          control={<Switch checked={noTimeLimit} onChange={e => setNoTimeLimit(e.target.checked)} sx={darkSwitch} />}
          label={<Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>No time limit</Typography>}
        />
        <TextField
          label="Deadline (optional)"
          type="datetime-local"
          value={deadline}
          onChange={e => setDeadline(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ ...darkInput, minWidth: 220 }}
        />
        <FormControlLabel
          control={<Switch checked={allowRetry} onChange={e => setAllowRetry(e.target.checked)} sx={darkSwitch} />}
          label={<Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Allow retry</Typography>}
        />
      </Box>

      <Box sx={divider} />

      {/* Exercises */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Typography sx={sectionLabel}>Exercises</Typography>
        <Typography sx={{ fontSize: 12, color: '#64ffda', fontWeight: 700 }}>
          {selectedExerciseIds.length} selected
        </Typography>
      </Box>

      {loadingEx ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress size={24} sx={{ color: '#64ffda' }} />
        </Box>
      ) : exercises.length === 0 ? (
        <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.2)', py: 2 }}>
          No exercises yet — create some first.
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {exercises.map(ex => (
            <ExerciseChip
              key={ex.id}
              ex={ex}
              selected={selectedExerciseIds.includes(ex.id)}
              onToggle={toggleExercise}
            />
          ))}
        </Box>
      )}

      <Box sx={divider} />

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={loading}
          sx={{
            background: 'linear-gradient(135deg, #64ffda, #4fc3f7)',
            color: '#0b0920', fontWeight: 700, borderRadius: '12px',
            textTransform: 'none', px: 3,
            '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(100,255,218,0.3)' },
            transition: 'all 0.2s',
          }}
        >
          {loading ? <CircularProgress size={18} sx={{ color: '#0b0920' }} /> : '💾 Save Changes'}
        </Button>
        <Button
          onClick={onClose}
          sx={{
            color: 'rgba(255,255,255,0.4)', borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)', textTransform: 'none', px: 3,
            '&:hover': { border: '1px solid rgba(255,255,255,0.25)', color: '#fff' },
          }}
        >
          Cancel
        </Button>
      </Box>
    </Box>
  );
}

export default EditExamForm;