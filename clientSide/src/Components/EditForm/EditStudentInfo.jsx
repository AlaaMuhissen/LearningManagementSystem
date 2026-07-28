import API_URL from '../../config/api.js';
import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getAuth } from 'firebase/auth';
import { useAuth } from '../Login/AuthContext';

function EditStudentInfo({ row, onClose }) {
  const [username, setUsername] = useState(row.username || row.name || '');
  const [email, setEmail] = useState(row.email || '');
  const [phone, setPhone] = useState(row.phone || '');
  const [address, setAddress] = useState(row.address || '');
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
    fetch(`${API_URL}/api/students/updateStudentDetails/${row.id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: username, email, phone, address }),
    })
      .then(res => res.json())
      .then(() => { toast.success('Student updated successfully'); window.location.reload(); })
      .catch(err => console.error(err));
    onClose();
  };

  return (
    <>
      <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
        <ToastContainer />
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Edit Student Information
          <IconButton edge="end" color="inherit" onClick={onClose}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField label="Username" fullWidth value={username} onChange={e => setUsername(e.target.value)} margin="normal" />
          <TextField label="Email" fullWidth value={email} onChange={e => setEmail(e.target.value)} margin="normal" />
          <TextField label="Phone" fullWidth value={phone} onChange={e => setPhone(e.target.value)} margin="normal" />
          <TextField label="Address" fullWidth value={address} onChange={e => setAddress(e.target.value)} margin="normal" />
          <Button variant="contained" color="primary" onClick={handleSave} sx={{ margin: '20px auto', display: 'block' }}>Save</Button>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default EditStudentInfo;