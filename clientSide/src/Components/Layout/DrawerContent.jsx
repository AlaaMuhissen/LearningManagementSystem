// DrawerContent.js
import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function DrawerContent({ currentComponent }) {
    return (
      <Box sx={{ margin: '20px' }}>
        <Typography variant="h4" gutterBottom>
          {currentComponent ? currentComponent.text : ''}
        </Typography>
        {currentComponent ? currentComponent.component : null}
      </Box>
    );
  }