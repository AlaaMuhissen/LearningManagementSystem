import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { ToastContainer, toast } from 'react-toastify';
import { Button } from '@mui/material';

function EditLessonInfo({ row, onClose }) {
  
  const [subject, setSubject] = useState(row.subject);
  const [description, setDescription] = useState(row.description);
  const [code, setCode] = useState(row.code);

  const handleSave = () => {
    
    fetch(`https://learningmanagementsystem.onrender.com/api/lessons/updateLessonDetails/${row.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subject: subject,
        description: description,
        code: code,
      }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(`Failed to update lesson: ${response.statusText}`);
        }
      })
      .then((data) => {
        console.log("Lesson updated successfully:", data);  
      })
      .catch((error) => {
        console.error("Error during update request:", error);
      });
      toast("Lesson updated successfully");
      window.location.reload();
    onClose();
  };
  

  return (
    <>
  
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
    <ToastContainer />
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        Edit Lesson Information
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
            label="subject"
            fullWidth
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder={row.subject}
            margin="normal"
          />
          <TextField
            label="description"
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={row.description}
            margin="normal"
          />
          <TextField
            label="code"
            fullWidth
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={row.code}
            margin="normal"
          />
           <Button variant="contained" color="primary" onClick={handleSave} sx={{ margin: '20px auto', display: 'block' }}>
  Save
</Button>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
}

export default EditLessonInfo;
