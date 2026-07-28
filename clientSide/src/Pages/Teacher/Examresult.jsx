import { Box, Paper, Typography, Button, CircularProgress } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

function ExamResult() {
  const { score, total } = useParams();
  const navigate = useNavigate();
  const percentage = Math.round((parseInt(score) / parseInt(total)) * 100);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', p: 3 }}>
      <Paper sx={{ p: 5, textAlign: 'center', maxWidth: 500, bgcolor: '#193255', borderRadius: 3 }}>
        <EmojiEventsIcon sx={{ fontSize: 80, color: '#FFD700', mb: 2 }} />
        <Typography variant="h4" color="#fff" fontWeight="bold" gutterBottom>
          Exam Complete!
        </Typography>

        <Box sx={{ position: 'relative', display: 'inline-flex', my: 3 }}>
          <CircularProgress
            variant="determinate"
            value={percentage}
            size={140}
            thickness={5}
            sx={{ color: percentage >= 70 ? '#4CAF50' : percentage >= 40 ? '#FF9800' : '#f44336' }}
          />
          <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="h4" color="#fff" fontWeight="bold">{percentage}%</Typography>
          </Box>
        </Box>

        <Typography variant="h6" color="#a0c4ff" gutterBottom>
          You got {score} out of {total} correct
        </Typography>

        <Typography color={percentage >= 70 ? '#4CAF50' : '#FF9800'} variant="h6" sx={{ mb: 3 }}>
          {percentage >= 70 ? '🎉 Great job!' : percentage >= 40 ? '👍 Good effort!' : '💪 Keep practicing!'}
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button variant="outlined" sx={{ color: '#a0c4ff' }} onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
          <Button variant="contained" onClick={() => navigate('/dashboard')}>
            My Exams
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default ExamResult;