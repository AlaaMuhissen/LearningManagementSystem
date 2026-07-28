import React from 'react';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

const SingleSelect = ({ selectedValue, onChange, availableOptions, label }) => {
  const handleChange = (event) => {
    onChange(event.target.value);
  };

  return (
    <FormControl fullWidth    margin="normal">
      <InputLabel id={`single-select-label-${label.toLowerCase()}`} >{label}</InputLabel>
      <Select
        labelId={`single-select-label-${label.toLowerCase()}`}
        id={`single-select-${label.toLowerCase()}`}
        value={selectedValue}
        onChange={handleChange}
      >
        {availableOptions?.map((option) => (
          <MenuItem key={option.id} value={option.id}>
            {option.description}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default SingleSelect;
