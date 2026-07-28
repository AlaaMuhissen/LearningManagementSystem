import { List, ListItem, ListItemButton, ListItemIcon, ListItemText, Box, Tooltip, Avatar } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import BoltIcon from '@mui/icons-material/Bolt';
import { useState } from 'react';
import { useAuth } from '../Login/AuthContext';
import { usePoints } from '../PointsContext';

export default function Sidebar({ open, contentOptions, handleContentChange, logout }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const { userData } = useAuth();
  const { points } = usePoints();

  const handleClick = (index) => {
    setActiveIndex(index);
    handleContentChange(index);
  };

  const initials = userData?.username?.slice(0, 2)?.toUpperCase() || '??';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Nav items */}
      <List sx={{ flex: 1, px: 1, pt: 1 }}>
        {contentOptions?.map((option, index) => {
          const isActive = activeIndex === index;
          return (
            <ListItem key={option.text} disablePadding sx={{ mb: 0.5 }}>
              <Tooltip title={!open ? option.text : ''} placement="right" arrow>
                <ListItemButton
                  onClick={() => handleClick(index)}
                  sx={{
                    minHeight: 44,
                    borderRadius: '10px',
                    justifyContent: open ? 'initial' : 'center',
                    px: open ? 1.5 : 1.5,
                    position: 'relative',
                    overflow: 'hidden',
                    background: isActive
                      ? 'linear-gradient(135deg, rgba(100,255,218,0.1), rgba(79,195,247,0.06))'
                      : 'transparent',
                    border: `1px solid ${isActive ? 'rgba(100,255,218,0.18)' : 'transparent'}`,
                    color: isActive ? '#64ffda' : 'rgba(255,255,255,0.5)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.04)',
                      color: '#fff',
                      border: '1px solid rgba(255,255,255,0.08)',
                    },
                  }}
                >
                  {/* Active accent bar */}
                  {isActive && (
                    <Box sx={{
                      position: 'absolute',
                      left: 0, top: '18%', bottom: '18%',
                      width: '3px',
                      background: 'linear-gradient(180deg, #64ffda, #4fc3f7)',
                      borderRadius: '0 3px 3px 0',
                    }} />
                  )}
                  <ListItemIcon sx={{
                    minWidth: 0,
                    mr: open ? 1.5 : 'auto',
                    justifyContent: 'center',
                    color: 'inherit',
                    fontSize: 20,
                    pl: isActive ? 0.5 : 0,
                  }}>
                    {option.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={option.text}
                    sx={{
                      opacity: open ? 1 : 0,
                      transition: 'opacity 0.2s',
                      '& .MuiListItemText-primary': {
                        fontSize: 13,
                        fontWeight: isActive ? 600 : 400,
                        whiteSpace: 'nowrap',
                      }
                    }}
                  />
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>

      {/* Bottom profile card */}
      <Box sx={{
        mx: 1, mb: 1.5,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '14px',
        overflow: 'hidden',
        transition: 'all 0.3s',
      }}>
        {/* Student XP bar — only when open */}
        {open && userData?.role === 'student' && (
          <Box sx={{
            px: 1.5, pt: 1.5, pb: 1,
            borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Box sx={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: 0.4 }}>
                <BoltIcon sx={{ fontSize: 12, color: '#ffd700' }} /> XP Points
              </Box>
              <Box sx={{ fontSize: 12, fontWeight: 700, color: '#ffd700' }}>{points}</Box>
            </Box>
            <Box sx={{
              height: 4, borderRadius: 2,
              background: 'rgba(255,255,255,0.06)',
              overflow: 'hidden',
            }}>
              <Box sx={{
                height: '100%',
                width: `${Math.min((points % 100), 100)}%`,
                background: 'linear-gradient(90deg, #64ffda, #ffd700)',
                borderRadius: 2,
                transition: 'width 0.5s ease',
              }} />
            </Box>
          </Box>
        )}

        {/* User info row */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: open ? 1 : 0,
          p: open ? 1.5 : 1,
          justifyContent: open ? 'flex-start' : 'center',
        }}>
          <Avatar sx={{
            width: 32, height: 32,
            fontSize: 12, fontWeight: 700,
            background: 'linear-gradient(135deg, #64ffda, #4fc3f7)',
            color: '#0b0920',
            flexShrink: 0,
          }}>
            {initials}
          </Avatar>
          {open && (
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ fontSize: 12, fontWeight: 600, color: '#fff', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {userData?.username}
              </Box>
              <Box sx={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'capitalize' }}>
                {userData?.role}
              </Box>
            </Box>
          )}
          {open && (
            <Tooltip title="Log out">
              <Box
                onClick={logout}
                sx={{
                  width: 28, height: 28, borderRadius: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'rgba(255,100,100,0.5)',
                  border: '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  flexShrink: 0,
                  '&:hover': {
                    background: 'rgba(239,68,68,0.1)',
                    color: '#fc8181',
                    border: '1px solid rgba(239,68,68,0.2)',
                  }
                }}
              >
                <LogoutIcon sx={{ fontSize: 15 }} />
              </Box>
            </Tooltip>
          )}
        </Box>

        {/* Collapsed logout */}
        {!open && (
          <Tooltip title="Log out" placement="right">
            <Box
              onClick={logout}
              sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                py: 1, cursor: 'pointer',
                color: 'rgba(255,100,100,0.4)',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                transition: 'all 0.2s',
                '&:hover': { color: '#fc8181', background: 'rgba(239,68,68,0.06)' }
              }}
            >
              <LogoutIcon sx={{ fontSize: 16 }} />
            </Box>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
}