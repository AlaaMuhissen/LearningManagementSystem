import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { ToastContainer, toast } from 'react-toastify';

function EditStudentInfo({ row, onClose }) {
  
  const [name, setName] = useState(row.name);
  const [email, setEmail] = useState(row.email);
  const [phone, setPhone] = useState(row.phone);
  const [progress, setProgress] = useState(row.progress);
  const [status, setStatus] = useState(row.status);

  const handleSave = () => {
    
    fetch(`http://localhost:3001/api/students/updateStudentDetails/${row.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name,
        email: email,
        phone: phone,
        progress: progress,
        status: status,
      }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(`Failed to update student: ${response.statusText}`);
        }
      })
      .then((data) => {
        console.log("Student updated successfully:", data);  
      })
      .catch((error) => {
        console.error("Error during update request:", error);
      });
      toast("Student updated successfully");
      window.location.reload();
    onClose();
  };
  

  return (
    <>
  
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
    <ToastContainer />
      <DialogTitle>
        Edit Student Information
        <IconButton
          edge="end"
          color="inherit"
          onClick={onClose}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <form>
          <TextField
            label="Name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={row.name}
          />
          <TextField
            label="Email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={row.email}
          />
          <TextField
            label="Phone"
            fullWidth
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={row.phone}
          />
          <TextField
            label="Progress"
            fullWidth
            value={progress}
            onChange={(e) => setProgress(e.target.value)}
            placeholder={row.progress}
          />
          <TextField
            label="Status"
            fullWidth
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            placeholder={row.status}
          />
          <button type="button" onClick={handleSave}>
            Save
          </button>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
}

export default EditStudentInfo;
