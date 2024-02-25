import React from 'react';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import Divider from '@mui/material/Divider';
import LogoutIcon from '@mui/icons-material/Logout';

export default function Sidebar({ open, contentOptions, handleContentChange, logout }) {
  return (
    <List>
      {contentOptions?.map((option, index) => (
        <ListItem key={option.text} disablePadding sx={{ display: 'block' }}>
          <ListItemButton
            onClick={() => handleContentChange(index)}
            sx={{
              minHeight: 48,
              justifyContent: open ? 'initial' : 'center',
              px: 2.5,
              color: '#ffffff',
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 3 : 'auto',
                justifyContent: 'center',
                color: '#ffffff',
              }}
            >
              {option.icon}
            </ListItemIcon>
            <ListItemText primary={option.text} sx={{ opacity: open ? 1 : 0 }} />
          </ListItemButton>
        </ListItem>
      ))}
      <ListItem>
        <button onClick={logout}>
          <ListItemIcon sx={{ color: '#ffffff' }}>
            <LogoutIcon />
          </ListItemIcon>
          LogOut
        </button>
      </ListItem>
    </List>
  );
}
