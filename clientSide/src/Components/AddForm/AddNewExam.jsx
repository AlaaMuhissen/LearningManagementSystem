import React, { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import MultipleSelectChip from '../inputs/MultipleSelectChip ';
import { useNavigate } from 'react-router-dom';

function AddNewExamForm() {
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
      const response = await fetch('https://learningmanagementsystem.onrender.com/api/exercises/getAllExercises');
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

  const handleSubmit = (e) => {
    e.preventDefault();

    const newExam = {
      description: description,
      grade: grade,
      exerciseids: selectedExercises,
    };

    fetch('https://learningmanagementsystem.onrender.com/api/exams/addNewExam', {
      method: 'POST',
      body: JSON.stringify(newExam),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((data) => navigate('/dashboard'))
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
