// DrawerContent.js
import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function DrawerContent({ currentComponent }) {

    return (
      <Box sx={{
         margin: '20px',
        '@media (max-width: 800px)': {
          margin: '10px',
          marginLeft: '50px',
          
        },
      }}>
       <Typography
            variant="h4"
            gutterBottom
            sx={{
              '@media (max-width: 800px)': {
                fontSize: '2rem',
              }
            }}
          >
          {currentComponent ? currentComponent?.text : 'My Exercises'}
        </Typography>
        {currentComponent ? currentComponent?.component : null}
      </Box>
    );
  }