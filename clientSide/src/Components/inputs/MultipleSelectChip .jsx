import React, { useState } from 'react';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Chip from '@mui/material/Chip';

const MultipleSelectChip = ({ selectedExercises, onChange, availableExercises }) => {
  const handleChange = (event) => {
    onChange(event.target.value);
  };

  return (
    <FormControl  margin="dense" sx={{ width: "100%" }}>
      <InputLabel id="multiple-chip-label"    margin="dense">Exercises</InputLabel>
      <Select
        labelId="multiple-chip-label"
        id="multiple-chip"
        multiple
        value={selectedExercises}
        margin="dense"
        onChange={handleChange}
        input={<OutlinedInput id="select-multiple-chip" label="Exercises" />}
        renderValue={(selected) => (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {selected.map((value) => {
              const selectedExercise = availableExercises.find((exercise) => exercise.id === value);
              return (
                <Chip key={value} label={selectedExercise ? selectedExercise.description : ''} />
              );
            })}
          </div>
        )}
      >
        {availableExercises.map((exercise) => (
          <MenuItem key={exercise.id} value={exercise.id}>
            {exercise.description}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default MultipleSelectChip;
