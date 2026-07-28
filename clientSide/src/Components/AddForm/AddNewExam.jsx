import { getAuth } from 'firebase/auth';
import API_URL from '../../config/api.js';
import  { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import MultipleSelectChip from '../inputs/MultipleSelectChip ';
import { useAuth } from '../Login/AuthContext';
import { useNavigate } from 'react-router-dom';

function AddNewExamForm() {
  const auth = getAuth();
  const { authToken, updateUser } = useAuth();
  const [description, setDescription] = useState('');
  const [grade, setGrade] = useState(0);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [availableExercises, setAvailableExercises] = useState([]);
  const navigate =useNavigate()

  useEffect(() => {
    fetchAvailableExercises();
  }, []);

  const fetchAvailableExercises = async () => {
    try {
      const response = await fetch(`${API_URL}/api/exercises/getAllExercises`);
      if (response.ok) {
        const data = await response.json();
        setAvailableExercises(data);
      } else {
        console.error('Failed to fetch exercises:', response.statusText);
      }
    } catch (error) {
      console.error('Error during fetch:', error);
    }
  };


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

    const newExam = {
      description: description,
      grade: grade,
      exerciseids: selectedExercises,
    };

    fetch(`${API_URL}/api/exams/addNewExam`, {
      method: 'POST',
      body: JSON.stringify(newExam),
      headers: {
        Authorization: `Bearer ${await refreshIdToken()}`,
          'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then(() => navigate('/dashboard'))
      .catch((err) => console.error(err));

    // Clear the form fields after submission
    setDescription('');
    setGrade(0);
    setSelectedExercises([]);
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
          Add New Exam
        </Typography>
        <Divider sx={{ marginBottom: 2 }} />
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
          label="Grade"
          variant="outlined"
          value={grade}
          onChange={(e) => setGrade(parseInt(e.target.value))}
          fullWidth
          required
          margin="normal" 
        />
        <MultipleSelectChip
          selectedExercises={selectedExercises}
          onChange={(value) => setSelectedExercises(value)}
          availableExercises={availableExercises}
        />
        <Button type="submit" variant="contained" color="primary" sx={{ marginTop: 2 }}>
          Add Exam
        </Button>
      </Paper>
    </Box>
  );
}

export default AddNewExamForm;