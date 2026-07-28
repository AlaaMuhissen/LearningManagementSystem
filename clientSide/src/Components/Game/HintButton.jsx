import API_URL from '../../config/api.js';
import { useState } from 'react';
import { Button, Paper, Typography, Box } from '@mui/material';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import { useAuth } from '../Login/AuthContext';

function HintButton({ hint, reward, onHintUsed, questionId, exerciseId }) {
  const [revealed, setRevealed] = useState(false);
  const [used, setUsed] = useState(false);
  const { userData } = useAuth();

  if (!hint) return null;

  const handleReveal = async () => {
    if (!revealed) {
      setRevealed(true);
      if (!used) {
        setUsed(true);
        if (onHintUsed) onHintUsed();
        // Track hint usage
        try {
          await fetch(`${API_URL}/api/teacher/trackHint`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              student_id: userData?.id,
              question_id: questionId || null,
              exercise_id: exerciseId || null,
            }),
          });
        } catch (e) {
          console.error('Error tracking hint:', e);
        }
      }
    }
  };

  const reducedPoints = Math.floor(reward * 0.7);

  return (
    <Box sx={{ mt: 2 }}>
      {!revealed ? (
        <Button
          startIcon={<LightbulbIcon />}
          variant="outlined"
          color="warning"
          size="small"
          onClick={handleReveal}
          sx={{ borderColor: '#FF9800', color: '#FF9800' }}
        >
          Use Hint (-{reward - reducedPoints} pts)
        </Button>
      ) : (
        <Paper sx={{ p: 2, bgcolor: '#2a1f00', border: '1px solid #FF9800', borderRadius: 2, mt: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <LightbulbIcon sx={{ color: '#FF9800', fontSize: 18 }} />
            <Typography variant="caption" color="#FF9800" fontWeight="bold">
              HINT (reward reduced to {reducedPoints} pts)
            </Typography>
          </Box>
          <Typography color="#fff" variant="body2">{hint}</Typography>
        </Paper>
      )}
    </Box>
  );
}

export default HintButton;