// AppBar.js
import React from 'react';
import {Toolbar, Typography } from '@mui/material';
import MuiAppBar from '@mui/material/AppBar';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../Login/AuthContext';
import { usePoints } from '../PointsContext';


const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

  
export default function AppBarMU({ open, handleDrawerOpen }) {
  const { userData } = useAuth();
  const { points } = usePoints();

  return (
    <AppBar position="fixed" open={open}>
      <Toolbar sx={{ bgcolor: '#193255' }}>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={handleDrawerOpen}
          edge="start"
          sx={{
            marginRight: 5,
            ...(open && { display: 'none' }),
          }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap component="div">
          {userData?.username}
        </Typography>
        {userData?.role === 'student' && (
          <Typography variant="h6" noWrap component="div">
            , Points: {points}
          </Typography>
        )}
      </Toolbar>
    </AppBar>
  );
}
