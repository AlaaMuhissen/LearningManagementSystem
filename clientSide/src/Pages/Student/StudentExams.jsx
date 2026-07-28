import API_URL from '../../config/api.js';
import  { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, Chip, CircularProgress,
  Grid, Divider, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import QuizIcon from '@mui/icons-material/Quiz';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAuth } from '../../Components/Login/AuthContext';
import { useNavigate } from 'react-router-dom';

function StudentExams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState(null);
  const { userData } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!userData?.id) return;
    fetch(`${API_URL}/api/teacher/studentExams/${userData.id}`)
      .then(res => res.json())
      .then(data => {
        setExams(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userData?.id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" color="#fff" gutterBottom>
        My Exams
      </Typography>
      <Typography color="#a0c4ff" sx={{ mb: 3 }}>
        Exams assigned by your teacher
      </Typography>

      {exams.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#193255' }}>
          <QuizIcon sx={{ fontSize: 60, color: '#5698f0', mb: 2 }} />
          <Typography variant="h6" color="#fff">No exams yet</Typography>
          <Typography color="#a0c4ff">Your teacher hasnot assigned any exams yet.</Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {exams.map(exam => {
            const isPastDeadline = exam.deadline && new Date(exam.deadline) < new Date();
            const isCompleted = !!exam.completed_at;
            const isLocked = isPastDeadline || (isCompleted && !exam.allow_retry);
            return (
            <Grid item xs={12} sm={6} md={4} key={exam.id}>
              <Paper sx={{
                p: 3, bgcolor: '#193255', border: '1px solid #2d4a6e',
                borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column',
                transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' }
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" color="#fff" fontWeight="bold">
                    {exam.title}
                  </Typography>
                  {exam.completed_at ? (
                    <Chip icon={<CheckCircleIcon />} label={`${exam.score ?? 0} pts`} color="success" size="small" />
                  ) : (
                    <Chip label="New" color="primary" size="small" />
                  )}
                </Box>

                {exam.description && (
                  <Typography color="#a0c4ff" variant="body2" sx={{ mb: 2 }}>
                    {exam.description}
                  </Typography>
                )}

                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <Chip
                    icon={<AccessTimeIcon />}
                    label={exam.time_limit ? `${exam.time_limit} min` : 'No time limit'}
                    size="small"
                    sx={{ bgcolor: '#0d1d32', color: '#a0c4ff' }}
                  />
                  <Chip
                    label={`By: ${exam.teacher_name}`}
                    size="small"
                    sx={{ bgcolor: '#0d1d32', color: '#a0c4ff' }}
                  />
                  {exam.deadline && (
                    <Chip
                      label={isPastDeadline ? '⛔ Deadline passed' : `Due: ${new Date(exam.deadline).toLocaleDateString()}`}
                      size="small"
                      color={isPastDeadline ? 'error' : 'warning'}
                    />
                  )}
                </Box>

                <Box sx={{ mt: 'auto' }}>
                  <Divider sx={{ borderColor: '#2d4a6e', mb: 2 }} />
                  <Button
                    fullWidth
                    variant="contained"
                    color={isLocked ? 'inherit' : isCompleted ? 'success' : 'primary'}
                    disabled={isLocked && !isCompleted}
                    onClick={() => !isLocked && setSelectedExam(exam)}
                  >
                    {isPastDeadline ? '⛔ Deadline Passed' :
                     isCompleted && !exam.allow_retry ? '✅ Submitted' :
                     isCompleted ? 'Retry' : 'Start Exam'}
                  </Button>
                </Box>
              </Paper>
            </Grid>
          );
          })}
        </Grid>
      )}

      {/* Exam start confirmation dialog */}
      <Dialog open={!!selectedExam} onClose={() => setSelectedExam(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#193255', color: '#fff' }}>
          {selectedExam?.title}
        </DialogTitle>
        <DialogContent sx={{ bgcolor: '#0d1d32', pt: 2 }}>
          <Typography color="#a0c4ff" sx={{ mb: 2 }}>
            {selectedExam?.description || 'Are you ready to start this exam?'}
          </Typography>
          {selectedExam?.time_limit && (
            <Chip
              icon={<AccessTimeIcon />}
              label={`Time limit: ${selectedExam.time_limit} minutes`}
              color="warning"
              sx={{ mb: 2 }}
            />
          )}
          <Typography color="#ff9800" variant="body2">
            ⚠️ Once you start, the timer will begin. Make sure you are ready!
          </Typography>
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#0d1d32', p: 2 }}>
          <Button onClick={() => setSelectedExam(null)} sx={{ color: '#a0c4ff' }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              navigate(`/exam/${selectedExam.id}`);
              setSelectedExam(null);
            }}
          >
            Start Now
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default StudentExams;