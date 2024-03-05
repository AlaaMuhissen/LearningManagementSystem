import React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import { ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from '@mui/icons-material';

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  bgcolor: '#193255',
}));

export default function Header({ handleDrawerClose }) {
  const theme = useTheme();

  return (
    <DrawerHeader>
      <IconButton onClick={handleDrawerClose}>
        {theme.direction === 'rtl' ? <ChevronRightIcon sx={{ color: '#ffffff' }} /> : <ChevronLeftIcon sx={{ color: '#ffffff' }} />}
      </IconButton>
    </DrawerHeader>
  );
}
