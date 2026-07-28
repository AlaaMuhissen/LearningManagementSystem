import { styled } from '@mui/material/styles';
import MuiAppBar from '@mui/material/AppBar';
import { Toolbar, IconButton, Box } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import { usePoints } from '../PointsContext';
import { useAuth } from '../Login/AuthContext';
import { useState, useEffect, useRef } from 'react';

const drawerWidth = 260;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open' && prop !== 'isMobile',
})(({ theme, open, isMobile }) => ({
  zIndex: theme.zIndex.drawer + 1,
  background: 'rgba(10, 14, 35, 0.92)',
  backdropFilter: 'blur(20px)',
  borderBottom: '1px solid rgba(100, 255, 218, 0.07)',
  boxShadow: 'none',
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  // Only shift width/margin on desktop, where the drawer actually pushes
  // content. On mobile the drawer should overlay instead, so the AppBar
  // stays full-width regardless of open/closed state.
  ...(open && !isMobile && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const motivations = [
  "Ready to level up today? 🚀",
  "Keep building — you're on fire! 🔥",
  "Every line of code counts! 💡",
  "Your future self says thanks! ⭐",
  "Let's write some great code! 💻",
];

function AnimatedPoints({ value }) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    const start = prevRef.current;
    const end = value;
    if (start === end) return;
    const duration = 800;
    const startTime = performance.now();
    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
    prevRef.current = end;
  }, [value]);

  return display;
}

export default function AppBarMU({ open, handleDrawerOpen, handleDrawerClose }) {
  const { points } = usePoints();
  const { userData } = useAuth();
  const [motivation] = useState(motivations[Math.floor(Math.random() * motivations.length)]);
  const isMobile = useMediaQuery('(max-width:900px)');

  return (
    <AppBar position="fixed" open={open} isMobile={isMobile}>
      <Toolbar sx={{ minHeight: '64px !important', px: 2.5, gap: 2 }}>

        {/* Menu toggle — single icon, no logo here */}
        <IconButton
          onClick={open ? handleDrawerClose : handleDrawerOpen}
          sx={{
            color: '#64ffda',
            borderRadius: '10px',
            border: '1px solid rgba(100,255,218,0.15)',
            width: 38, height: 38, flexShrink: 0,
            '&:hover': { background: 'rgba(100,255,218,0.08)', borderColor: 'rgba(100,255,218,0.3)' }
          }}
        >
          {open
            ? <MenuOpenIcon sx={{ fontSize: 20 }} />
            : <MenuIcon sx={{ fontSize: 20 }} />}
        </IconButton>

        {/* Greeting */}
        <Box sx={{ flex: 1, display: { xs: 'none', sm: 'block' } }}>
          <Box sx={{
            fontSize: 15,
            fontWeight: 600,
            color: '#fff',
            lineHeight: 1.3,
          }}>
            Hi, <span style={{
              background: 'linear-gradient(90deg, #64ffda, #4fc3f7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>{userData?.username}</span> 👋
          </Box>
          <Box sx={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', mt: 0.2 }}>
            {motivation}
          </Box>
        </Box>

        {/* Animated XP */}
        {userData?.role === 'student' && (
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            background: 'rgba(255,215,0,0.07)',
            border: '1px solid rgba(255,215,0,0.18)',
            borderRadius: '16px',
            px: 2.5, py: 1,
            position: 'relative',
            overflow: 'hidden',
            cursor: 'default',
          }}>
            <Box sx={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,215,0,0.06) 50%, transparent 100%)',
              animation: 'shimmer 2.5s ease-in-out infinite',
              '@keyframes shimmer': {
                '0%': { transform: 'translateX(-100%)' },
                '100%': { transform: 'translateX(100%)' },
              }
            }} />
            <Box sx={{
              fontSize: 22,
              animation: 'bolt 1.5s ease-in-out infinite',
              '@keyframes bolt': {
                '0%,100%': { transform: 'scale(1)', filter: 'drop-shadow(0 0 4px #ffd700)' },
                '50%': { transform: 'scale(1.3)', filter: 'drop-shadow(0 0 10px #ffd700)' },
              }
            }}>⚡</Box>
            <Box>
              <Box sx={{
                fontSize: 22,
                fontWeight: 900,
                color: '#ffd700',
                lineHeight: 1,
                letterSpacing: '-0.5px',
                fontVariantNumeric: 'tabular-nums',
              }}>
                <AnimatedPoints value={points} />
              </Box>
              <Box sx={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: 1.5,
                textTransform: 'uppercase',
                color: 'rgba(255,215,0,0.5)',
              }}>XP</Box>
            </Box>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}