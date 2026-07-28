import { Box } from '@mui/material';

export default function DrawerContent({ currentComponent }) {
  return (
    <Box sx={{
      minHeight: 'calc(100vh - 60px)',
      background: 'linear-gradient(160deg, #0d1228 0%, #0a1020 100%)',
      borderRadius: '16px',
      p: { xs: 2, sm: 3 },
      border: '1px solid rgba(255,255,255,0.04)',
    }}>
      {currentComponent?.component ?? null}
    </Box>
  );
}