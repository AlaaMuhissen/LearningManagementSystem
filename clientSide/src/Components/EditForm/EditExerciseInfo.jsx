import API_URL from '../../config/api.js';
import  { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { Button } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import SingleSelect from '../inputs/SingleSelect';
import { getAuth } from 'firebase/auth';
import { useAuth } from '../Login/AuthContext';

function EditExerciseInfo({ row, onClose }) {
  const [description, setDescription] = useState(row.description);
  const [grade, setGrade] = useState(row.grade);
  const [code, setCode] = useState(row.code);
  const [selectedLesson, setSelectedLesson] = useState(row.lesson_id);
  const [availableLessons, setAvailableLessons] = useState([]);
  const auth = getAuth();
  const { authToken, updateUser } = useAuth();

  const refreshIdToken = async () => {
    const user = auth.currentUser;
    if (user) {
      const freshToken = await user.getIdToken(true);
      updateUser({ ...authToken, token: freshToken });
      return freshToken;
    }
  };

  useEffect(() => {
    fetch(`${API_URL}/api/lessons/getAllLessons`)
      .then(res => res.json())
      .then(data => setAvailableLessons(data))
      .catch(err => console.error(err));
  }, []);

  const handleSave = async () => {
    const token = await refreshIdToken();
    fetch(`${API_URL}/api/exercises/updateExercise/${row.id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ description, grade, code, lessonid: selectedLesson }),
    })
      .then(res => res.json())
      .then(() => { toast('Exercise updated successfully'); window.location.reload(); })
      .catch(err => console.error(err));
    onClose();
  };

  return (
    <>
      <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
        <ToastContainer />
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Edit Exercise Information
          <IconButton edge="end" color="inherit" onClick={onClose}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField label="Description" fullWidth value={description} onChange={e => setDescription(e.target.value)} margin="normal" />
          <TextField label="Grade" fullWidth value={grade} onChange={e => setGrade(parseFloat(e.target.value))} margin="normal" />
          <TextField label="Code" fullWidth value={code} onChange={e => setCode(e.target.value)} margin="normal" />
          <SingleSelect selectedValue={selectedLesson} onChange={value => setSelectedLesson(value)} availableOptions={availableLessons} label="Lesson" />
          <Button variant="contained" color="primary" onClick={handleSave} sx={{ margin: '20px auto', display: 'block' }}>Save</Button>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default EditExerciseInfo;