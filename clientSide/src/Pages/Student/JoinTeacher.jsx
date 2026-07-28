import API_URL from '../../config/api.js';
import  { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, CircularProgress } from '@mui/material';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import { useAuth } from '../../Components/Login/AuthContext.jsx';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function JoinTeacher() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { userData } = useAuth();

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!code.trim()) return toast.error('Enter a join code');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/teacher/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: userData.id, code: code.toUpperCase() }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Joined successfully! Your teacher can now assign you exams.');
        setCode('');
      } else {
        toast.error(data.error || 'Invalid code');
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', p: 3 }}>
      <ToastContainer />
      <Paper sx={{ p: 5, maxWidth: 400, width: '100%', bgcolor: '#193255', borderRadius: 3, textAlign: 'center' }}>
        <GroupAddIcon sx={{ fontSize: 60, color: '#5698f0', mb: 2 }} />
        <Typography variant="h5" color="#fff" fontWeight="bold" gutterBottom>
          Join a Teacher
        </Typography>
        <Typography color="#a0c4ff" sx={{ mb: 3 }}>
          Enter the 6-character code your teacher shared with you
        </Typography>
        <Box component="form" onSubmit={handleJoin}>
          <TextField
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. A1B2C3"
            fullWidth
            inputProps={{ maxLength: 10, style: { textAlign: 'center', fontSize: 28, letterSpacing: 8, fontWeight: 'bold' } }}
            sx={{ mb: 3, '& input': { color: '#5698f0' } }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Join Class'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default JoinTeacher;