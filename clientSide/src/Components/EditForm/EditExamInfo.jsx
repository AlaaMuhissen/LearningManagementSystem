import React, { useState ,useEffect} from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { ToastContainer, toast } from 'react-toastify';
import MultipleSelectChip from '../inputs/MultipleSelectChip ';
import { Button } from '@mui/material';

function EditExamInfo({ row, onClose }) {
  
  const [description, setDescription] = useState(row.description);
  const [grade, setGrade] = useState(row.grade);
  const [selectedExercises, setSelectedExercises] = useState(row.exerciseids);
  const [availableExercises, setAvailableExercises] = useState([]);
 

  useEffect(() => {
    fetchAvailableExercises();
  }, []);

  const fetchAvailableExercises = async () => {
    try {
      const response = await fetch('https://learningmanagementsystem.onrender.com/api/exercises/getAllExercises');
      if (response.ok) {
        const data = await response.json();
        setAvailableExercises(data);
      } else {
        console.error('Failed to fetch exercises:', response.statusText);
      }
    } catch (error) {
      console.error('Error during fetch:', error);
    }
  };

  const handleSave = () => {
    
    fetch(`https://learningmanagementsystem.onrender.com/api/exams/updateExamDetails/${row.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        description: description,
        grade: grade,
        exerciseids: selectedExercises,
      }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(`Failed to update exam: ${response.statusText}`);
        }
      })
      .then((data) => {
        console.log("Exam updated successfully:", data);  
      })
      .catch((error) => {
        console.error("Error during update request:", error);
      });
      toast("Exam updated successfully");
     window.location.reload();
    onClose();
  };
  

  return (
    <>
  
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
    <ToastContainer />
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        Edit Exam Information
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
      <MultipleSelectChip
        selectedExercises={selectedExercises}
        onChange={(value) => setSelectedExercises(value)}
            availableExercises ={availableExercises}
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

export default EditExamInfo;
