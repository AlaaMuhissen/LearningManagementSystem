import { styled } from '@mui/material/styles';
import { IconButton, Box } from '@mui/material';
import { ChevronLeft as ChevronLeftIcon } from '@mui/icons-material';

const DrawerHeaderStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(0, 1.5),
  minHeight: '60px',
  borderBottom: '1px solid rgba(100, 255, 218, 0.08)',
}));

export default function Header({ handleDrawerClose }) {
  return (
    <DrawerHeaderStyled>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 0.5 }}>
        <span style={{ fontSize: 18 }}>💻</span>
        <span style={{
          fontSize: 16,
          fontWeight: 800,
          background: 'linear-gradient(90deg, #64ffda, #4fc3f7)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          CodeQuest
        </span>
      </Box>
      <IconButton
        onClick={handleDrawerClose}
        size="small"
        sx={{
          color: 'rgba(255,255,255,0.3)',
          '&:hover': { color: '#64ffda', background: 'rgba(100,255,218,0.08)' }
        }}
      >
        <ChevronLeftIcon />
      </IconButton>
    </DrawerHeaderStyled>
  );
}