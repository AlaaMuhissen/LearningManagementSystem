import API_URL from '../../config/api.js';
import { useState, useEffect } from 'react';
import { Typography, Box, CircularProgress } from '@mui/material';
import { useAuth } from '../../Components/Login/AuthContext';
import { Email, Phone, LocationOn, School, Work, Star, EmojiEvents } from '@mui/icons-material';
import AvatarImg from '/boy.png';

// ---- Theme tokens (shared with rest of app) ----
const TEAL = '#64ffda';
const BLUE = '#4fc3f7';
const PURPLE = '#a78bfa';

const glassCard = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '16px',
};

const sectionLabel = {
  color: TEAL,
  fontFamily: '"JetBrains Mono", monospace',
  fontSize: '0.75rem',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  mb: 1.5,
  display: 'block',
};

const infoRowSx = {
  display: 'flex',
  alignItems: 'center',
  gap: 1.5,
  py: 1.25,
  px: 1.5,
  borderRadius: '10px',
  transition: 'background 0.15s',
  '&:hover': { background: 'rgba(255,255,255,0.03)' },
};

const iconBadgeSx = (color) => ({
  width: 32, height: 32, borderRadius: '9px',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: `${color}1f`,
  border: `1px solid ${color}55`,
  color,
  flexShrink: 0,
});

function InfoRow({ icon, label, value, color = TEAL }) {
  return (
    <Box sx={infoRowSx}>
      <Box sx={iconBadgeSx(color)}>{icon}</Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: '0.92rem', color: '#e6f1ff', fontWeight: 500, wordBreak: 'break-word' }}>
          {value || '—'}
        </Typography>
      </Box>
    </Box>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <Box sx={{
      ...glassCard,
      flex: '1 1 130px',
      p: 2,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5,
      textAlign: 'center',
    }}>
      <Box sx={{ ...iconBadgeSx(color), width: 36, height: 36 }}>{icon}</Box>
      <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, color: '#e6f1ff', mt: 0.5 }}>
        {value}
      </Typography>
      <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </Typography>
    </Box>
  );
}

function UserProfile() {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { userData } = useAuth();
  const userId = userData?.id;

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    fetch(`${API_URL}/api/user/fetchUserProfile/${userId}`)
      .then(response => response.json())
      .then(data => {
        setUserProfile(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching user data:', error);
        setLoading(false);
      });
  }, [userId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress sx={{ color: TEAL }} size={48} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 640, mx: 'auto' }}>

      {/* Header card */}
      <Box sx={{ ...glassCard, p: { xs: 3, sm: 4 }, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Subtle gradient glow behind avatar */}
        <Box sx={{
          position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)',
          width: 200, height: 200, borderRadius: '50%',
          background: `radial-gradient(circle, ${TEAL}22, transparent 70%)`,
          pointerEvents: 'none',
        }} />

        <Box sx={{
          position: 'relative',
          width: 108, height: 108, borderRadius: '50%', mx: 'auto', mb: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `linear-gradient(135deg, ${TEAL}, ${BLUE})`,
          padding: '3px',
        }}>
          <Box sx={{
            width: '100%', height: '100%', borderRadius: '50%',
            background: '#0d1228',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
          }}>
            <img src={AvatarImg} alt="profile" style={{ width: '72%', height: '72%', objectFit: 'contain' }} />
          </Box>
        </Box>

        <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#e6f1ff' }}>
          {userData.username}
        </Typography>
        <Box sx={{
          display: 'inline-flex', alignItems: 'center', gap: 0.75, mt: 1,
          px: 1.5, py: 0.5, borderRadius: '999px',
          background: `${PURPLE}1a`, border: `1px solid ${PURPLE}44`,
        }}>
          <Work sx={{ fontSize: 14, color: PURPLE }} />
          <Typography sx={{ fontSize: '0.75rem', color: PURPLE, fontWeight: 700, textTransform: 'capitalize', fontFamily: '"JetBrains Mono", monospace' }}>
            {userData.role}
          </Typography>
        </Box>
      </Box>

      {/* Stats row */}
      {userProfile && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
          <StatCard icon={<Star sx={{ fontSize: 18 }} />} label="Points" value={userProfile.Points ?? 0} color="#FFD700" />
          <StatCard icon={<School sx={{ fontSize: 18 }} />} label="Syllabus #" value={userProfile.syllbusNum ?? 0} color={BLUE} />
          <StatCard icon={<EmojiEvents sx={{ fontSize: 18 }} />} label="Res. Teachers" value={userProfile.resTeacherNum ?? 0} color={PURPLE} />
        </Box>
      )}

      {/* Contact info */}
      <Box sx={{ ...glassCard, p: { xs: 2.5, sm: 3 }, mt: 2 }}>
        <Typography sx={sectionLabel}>Contact Info</Typography>
        <InfoRow icon={<Email sx={{ fontSize: 17 }} />} label="Email" value={userData.email} color={TEAL} />
        <InfoRow icon={<Phone sx={{ fontSize: 17 }} />} label="Phone" value={userData.phone} color={BLUE} />
        <InfoRow icon={<LocationOn sx={{ fontSize: 17 }} />} label="Address" value={userData.address} color={PURPLE} />
      </Box>

      {/* Academic info */}
      {userProfile && (
        <Box sx={{ ...glassCard, p: { xs: 2.5, sm: 3 }, mt: 2, mb: 2 }}>
          <Typography sx={sectionLabel}>Academic Info</Typography>
          <InfoRow
            icon={<School sx={{ fontSize: 17 }} />}
            label="Primary Syllabus ID"
            value={userProfile.pimarySyllbus_id ?? 'N/A'}
            color={TEAL}
          />
        </Box>
      )}
    </Box>
  );
}

export default UserProfile;