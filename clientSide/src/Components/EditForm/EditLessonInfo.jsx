import API_URL from '../../config/api.js';
import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { Button } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import { getAuth } from 'firebase/auth';
import { useAuth } from '../Login/AuthContext';

function EditLessonInfo({ row, onClose }) {
  const [subject, setSubject] = useState(row.subject);
  const [description, setDescription] = useState(row.description);
  const [code, setCode] = useState(row.code);
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

  const handleSave = async () => {
    const token = await refreshIdToken();
    fetch(`${API_URL}/api/lessons/updateLessonDetails/${row.id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, description, code }),
    })
      .then(res => res.json())
      .then(() => { toast('Lesson updated successfully'); window.location.reload(); })
      .catch(err => console.error(err));
    onClose();
  };

  return (
    <>
      <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
        <ToastContainer />
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Edit Lesson Information
          <IconButton edge="end" color="inherit" onClick={onClose}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField label="Subject" fullWidth value={subject} onChange={e => setSubject(e.target.value)} margin="normal" />
          <TextField label="Description" fullWidth value={description} onChange={e => setDescription(e.target.value)} margin="normal" />
          <TextField label="Code" fullWidth value={code} onChange={e => setCode(e.target.value)} margin="normal" />
          <Button variant="contained" color="primary" onClick={handleSave} sx={{ margin: '20px auto', display: 'block' }}>Save</Button>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default EditLessonInfo;