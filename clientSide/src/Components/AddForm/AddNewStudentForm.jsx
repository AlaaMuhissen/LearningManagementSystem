import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import { useNavigate } from 'react-router-dom';

function AddNewStudentForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [progress, setProgress] = useState('');
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    const newStudent = {
      name: name,
      email: email,
      phone: phone,
      progress: progress,
      status: status,
    };

    fetch(`http://localhost:3001/api/students/addNewStudent`, {
      method: 'POST',
      body: JSON.stringify(newStudent),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((data) => navigate('/dashboard'))
      .catch((err) => console.error(err));

    // Clear the form fields after submission
    setName('');
    setEmail('');
    setPhone('');
    setProgress('');
    setStatus('');
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
          Add New Student
        </Typography>
        <Divider sx={{ marginBottom: 2 }} />
        <TextField
          label="Name"
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          required
          margin="normal"
        />
        <TextField
          label="Email"
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          required
          margin="normal"
        />
        <TextField
          label="Phone"
          variant="outlined"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          fullWidth
          required
          margin="normal"
        />
        <TextField
          label="Progress"
          variant="outlined"
          value={progress}
          onChange={(e) => setProgress(e.target.value)}
          fullWidth
          required
          margin="normal"
        />
        <TextField
          label="Status"
          variant="outlined"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          fullWidth
          required
          margin="normal"
        />
        <Button type="submit" variant="contained" color="primary" sx={{ marginTop: 2 }}>
          Add Student
        </Button>
      </Paper>
    </Box>
  );
}

export default AddNewStudentForm;
