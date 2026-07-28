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

function AddNewStudentForm() {
  const auth = getAuth();
  const { authToken, updateUser } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [progress, setProgress] = useState('');
  const [address, setAddress] = useState('');
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

    const newStudent = {
      username: username,
      email: email,
      password : password,
      phone: phone,
      address: address,
      progress: progress,
      role: 'student'
    };

    fetch(`${API_URL}/api/students/addNewStudent`, {
      method: 'POST',
      body: JSON.stringify(newStudent),
      headers: {
        Authorization: `Bearer ${await refreshIdToken()}`,
          'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then(() => navigate('/dashboard'))
      .catch((err) => console.error(err));

    // Clear the form fields after submission
    setUsername('');
    setEmail('');
    setPassword('')
    setPhone('');
    setAddress('');
    setProgress('');
 
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
          label="Username"
          variant="outlined"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
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
          label="Password"
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
          label="Address"
          variant="outlined"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
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