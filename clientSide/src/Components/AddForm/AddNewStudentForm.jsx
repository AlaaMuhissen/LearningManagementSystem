import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
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
    };

    fetch(`http://localhost:3001/api/students/addNewStudent`, {
        method: 'POST',
        body: JSON.stringify(newStudent),
        headers: {
          'Content-Type': 'application/json', 
        },
    })
    .then(res => res.json())
    .then(data => console.log(data))
    .catch(err => console.error(err));

    // Clear the form fields after submission
    setName('');
    setEmail('');
    setPhone('');
    setProgress('');
    navigate('/dashboard')
};


  return (
    <form onSubmit={handleSubmit}>
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
      <Button type="submit" variant="contained" color="primary">
        Add Student
      </Button>
    </form>
  );
}

export default AddNewStudentForm;
