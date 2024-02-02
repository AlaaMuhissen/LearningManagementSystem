import React, { useState ,useEffect} from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { ToastContainer, toast } from 'react-toastify';
import SingleSelect from '../inputs/SingleSelect';
import { Button } from '@mui/material';

function EditExerciseInfo({ row, onClose }) {
  
  const [description, setDescription] = useState(row.description);
  const [grade, setGrade] = useState(row.grade);
  const [code, setCode] = useState(row.code);
  const [selectedLesson, setSelectedLesson] = useState(row.lessonid);
  const [availableLessons, setAvailableLessons] = useState([]);
  
  useEffect(() => {
    fetchAvailableLessons();
  }, []);

  const fetchAvailableLessons = async () => {
    try {
      const response = await fetch('https://learningmanagementsystem.onrender.com/api/lessons/getAllLessons');
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

  const handleSave = () => {
    
    fetch(`https://learningmanagementsystem.onrender.com/api/exercises/updateExercise/${row.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        description: description,
        grade: grade,
        code: code,
        lessonid: selectedLesson,
      }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(`Failed to update exercise: ${response.statusText}`);
        }
      })
      .then((data) => {
        console.log("Exercise updated successfully:", data);  
      })
      .catch((error) => {
        console.error("Error during update request:", error);
      });
      toast("Exercise updated successfully");
     window.location.reload();
    onClose();
  };
  

  return (
    <>
  
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
    <ToastContainer />
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        Edit Exercise Information
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
            label="description"
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={row.description}
            margin="normal"
          />
          <TextField
            label="grade"
            fullWidth
            value={grade}
            onChange={(e) => setGrade(parseFloat(e.target.value))}
            placeholder={row.grade}
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
            <Button variant="contained" color="primary" onClick={handleSave} sx={{ margin: '20px auto', display: 'block' }}>
  Save
</Button>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
}

export default EditExerciseInfo;
