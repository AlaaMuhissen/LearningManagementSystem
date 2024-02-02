import React, { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import SingleSelect from '../inputs/SingleSelect';
import { useNavigate } from 'react-router-dom';

function AddNewExerciseForm() {
  const [description, setDescription] = useState('');
  const [grade, setGrade] = useState(0);
  const [code, setCode] = useState('');
  const [selectedLesson, setSelectedLesson] = useState('');
  const [availableLessons, setAvailableLessons] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAvailableLessons();
  }, []);

  const fetchAvailableLessons = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/lessons/getAllLessons');
      if (response.ok) {
        const data = await response.json();
        setAvailableLessons(data);
      } else {
        console.error('Failed to fetch lessons:', response.statusText);
      }
    } catch (error) {
      console.error('Error during fetch:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newExercise = {
      description: description,
      grade: grade,
      code: code,
      lessonid: selectedLesson,
    };

    fetch('http://localhost:3001/api/exercises/addNewExercise', {
      method: 'POST',
      body: JSON.stringify(newExercise),
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
    setCode('');
    setSelectedLesson('');
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
          Add New Exercise
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
        <TextField
          label="Code"
          variant="outlined"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          fullWidth
          required
          margin="normal"
        />
        <SingleSelect
          selectedValue={selectedLesson}
          onChange={(value) => setSelectedLesson(value)}
          availableOptions={availableLessons}
          label="Lesson"
        />
        <Button type="submit" variant="contained" color="primary" sx={{ marginTop: 2 }}>
          Add Exercise
        </Button>
      </Paper>
    </Box>
  );
}

export default AddNewExerciseForm;
