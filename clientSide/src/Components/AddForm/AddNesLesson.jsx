import { getAuth } from 'firebase/auth';
import API_URL from '../../config/api.js';
import  { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import { useAuth } from '../Login/AuthContext';
import { useNavigate } from 'react-router-dom';

function AddNewLessonForm() {
  const auth = getAuth();
  const { authToken, updateUser } = useAuth();
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('');
  const navigate = useNavigate();

  const refreshIdToken = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const freshToken = await user.getIdToken(true);
        updateUser({ ...authToken, token: freshToken });
        return freshToken;
      }
    } catch (error) {
      console.error('Error refreshing ID token:', error);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newLesson = {
      subject: subject,
      description: description,
      code: code,
    };

    fetch(`${API_URL}/api/lessons/addNewLesson`, {
      method: 'POST',
      body: JSON.stringify(newLesson),
      headers: {
        Authorization: `Bearer ${await refreshIdToken()}`,
          'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then(() => navigate('/dashboard'))
      .catch((err) => console.error(err));

    // Clear the form fields after submission
    setSubject('');
    setDescription('');
    setCode('');
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 3,
        minHeight: '100vh',
        justifyContent: 'center',
      }}
    >
      <Paper elevation={3} sx={{ padding: 3, width: '100%' }}>
        <Typography variant="h5" gutterBottom>
          Add New Lesson
        </Typography>
        <Divider sx={{ marginBottom: 2 }} />
        <TextField
          label="Subject"
          variant="outlined"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          fullWidth
          required
          margin="normal"
        />
        <TextField
          label="Description"
          variant="outlined"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          required
          margin="normal"
        />
        <TextField
          label="Code"
          variant="outlined"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          fullWidth
          required
          margin="normal"
        />
        <Button type="submit" variant="contained" color="primary" sx={{ marginTop: 2 }}>
          Add Lesson
        </Button>
      </Paper>
    </Box>
  );
}

export default AddNewLessonForm;