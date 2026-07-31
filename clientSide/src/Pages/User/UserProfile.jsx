import API_URL from '../../config/api.js';
import { useState, useEffect } from 'react';
import { Typography, Box, CircularProgress, TextField, IconButton } from '@mui/material';
import { useAuth } from '../../Components/Login/AuthContext';
import { getAuth, verifyBeforeUpdateEmail } from 'firebase/auth';
import { Email, Phone, LocationOn, School, Work, Star, EmojiEvents, Edit, Close, Save, CheckCircle } from '@mui/icons-material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BoyAvatar from '/boy.png';
import GirlAvatar from '/girl.png';

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

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    background: 'rgba(255,255,255,0.02)',
    borderRadius: '10px',
    color: '#e6f1ff',
    fontSize: '0.92rem',
    '& fieldset': { borderColor: 'rgba(255,255,255,0.12)' },
    '&:hover fieldset': { borderColor: 'rgba(100,255,218,0.4)' },
    '&.Mui-focused fieldset': { borderColor: TEAL },
    '&.Mui-disabled fieldset': { borderColor: 'rgba(255,255,255,0.06)' },
  },
  '& .MuiOutlinedInput-input.Mui-disabled': {
    WebkitTextFillColor: 'rgba(255,255,255,0.4)',
  },
};

// ---- Validation ----
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Digits, spaces, +, -, (), 7–15 digits total — reasonably permissive across
// international formats without accepting arbitrary text.
const PHONE_RE = /^\+?[0-9\s\-()]{7,20}$/;

function sanitizePhoneInput(value) {
  // Strip anything that isn't a digit, space, +, -, ( or ) as the user types —
  // stops "hello" from ever landing in the field at all, rather than only
  // catching it at submit time.
  return value.replace(/[^0-9\s\-()+]/g, '');
}

const AVATAR_OPTIONS = [
  { id: 'boy', label: 'Boy', src: BoyAvatar },
  { id: 'girl', label: 'Girl', src: GirlAvatar },
];

function getStoredAvatar(userId) {
  return window.localStorage.getItem(`avatar_pref_${userId}`) || 'boy';
}

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

function EditRow({ icon, label, value, onChange, color = TEAL, disabled = false, error = '' }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, py: 0.75, px: 1.5 }}>
      <Box sx={{ ...iconBadgeSx(color), mt: 0.25 }}>{icon}</Box>
      <Box sx={{ flex: 1 }}>
        <TextField
          label={label}
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
          fullWidth
          size="small"
          error={!!error}
          helperText={error || ' '}
          sx={{
            ...fieldSx,
            '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' },
            '& .MuiInputLabel-root.Mui-focused': { color: TEAL },
            '& .MuiFormHelperText-root': { fontSize: '0.7rem', ml: 0, mt: 0.25 },
          }}
        />
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
  const { userData, refreshUserData } = useAuth();
  const userId = userData?.id;

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ username: '', phone: '', address: '' });
  const [errors, setErrors] = useState({});
  const [avatarChoice, setAvatarChoice] = useState('boy');

  // Email change is a separate, slower flow (Firebase requires verification
  // before the email actually changes) — kept apart from the main form.
  const [newEmail, setNewEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [pendingEmail, setPendingEmail] = useState(null); // set once verification is sent
  const [sendingVerification, setSendingVerification] = useState(false);
  const [checkingVerification, setCheckingVerification] = useState(false);

  const auth = getAuth();

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setAvatarChoice(getStoredAvatar(userId));
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

  // Restore a pending email-verification state across reloads
  useEffect(() => {
    if (!userId) return;
    const stored = window.localStorage.getItem(`pending_email_${userId}`);
    if (stored) setPendingEmail(stored);
  }, [userId]);

  const startEditing = () => {
    setForm({
      username: userData.username || '',
      phone: userData.phone || '',
      address: userData.address || '',
    });
    setErrors({});
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setAvatarChoice(getStoredAvatar(userId)); // revert any unsaved avatar pick
  };

  const validateForm = () => {
    const errs = {};
    if (!form.username.trim()) errs.username = 'Name is required';
    if (form.phone && !PHONE_RE.test(form.phone)) {
      errs.phone = 'Enter a valid phone number (7–20 digits)';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const saveProfile = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      const token = await auth.currentUser?.getIdToken(true);
      const res = await fetch(`${API_URL}/api/students/updateStudentDetails/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          username: form.username,
          email: userData.email, // email changes go through the separate verified flow below
          phone: form.phone,
          address: form.address,
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        return toast.error(errBody.error || 'Failed to update profile');
      }

      // Avatar choice is local-only for now (no DB column for it yet)
      window.localStorage.setItem(`avatar_pref_${userId}`, avatarChoice);

      toast.success('Profile updated!');
      setEditing(false);
      refreshUserData?.();
    } catch (error) {
      toast.error('Network error — please try again');
    } finally {
      setSaving(false);
    }
  };

  // ---- Email change flow ----
  const sendEmailVerification = async () => {
    setEmailError('');
    if (!EMAIL_RE.test(newEmail)) {
      setEmailError('Enter a valid email address');
      return;
    }
    if (newEmail === userData.email) {
      setEmailError("That's already your current email");
      return;
    }
    setSendingVerification(true);
    try {
      await verifyBeforeUpdateEmail(auth.currentUser, newEmail);
      window.localStorage.setItem(`pending_email_${userId}`, newEmail);
      setPendingEmail(newEmail);
      setNewEmail('');
      toast.success(`Verification link sent to ${newEmail} — click it, then come back and confirm here.`);
    } catch (error) {
      if (error.code === 'auth/requires-recent-login') {
        toast.error('For security, please log out and log back in before changing your email.');
      } else if (error.code === 'auth/email-already-in-use') {
        setEmailError('That email is already in use by another account');
      } else {
        toast.error(error.message || 'Could not send verification email');
      }
    } finally {
      setSendingVerification(false);
    }
  };

  const confirmEmailVerified = async () => {
    setCheckingVerification(true);
    try {
      await auth.currentUser.reload();
      const currentEmail = auth.currentUser.email;

      if (currentEmail !== pendingEmail) {
        toast.info("Not verified yet — check your inbox and click the link first.");
        return;
      }

      // Firebase's email has changed — now sync the DB record to match.
      const token = await auth.currentUser.getIdToken(true);
      const res = await fetch(`${API_URL}/api/students/updateStudentDetails/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          username: userData.username,
          email: currentEmail,
          phone: userData.phone,
          address: userData.address,
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        toast.error(errBody.error || 'Email verified, but syncing your profile failed — try again.');
        return;
      }

      window.localStorage.removeItem(`pending_email_${userId}`);
      setPendingEmail(null);
      toast.success('Email updated!');
      refreshUserData?.();
    } catch (error) {
      toast.error('Could not confirm verification — please try again.');
    } finally {
      setCheckingVerification(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress sx={{ color: TEAL }} size={48} />
      </Box>
    );
  }

  const currentAvatarSrc = AVATAR_OPTIONS.find(a => a.id === avatarChoice)?.src || BoyAvatar;

  return (
    <Box sx={{ maxWidth: 640, mx: 'auto' }}>
      <ToastContainer theme="dark" />

      {/* Header card */}
      <Box sx={{ ...glassCard, p: { xs: 3, sm: 4 }, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <IconButton
          onClick={editing ? cancelEditing : startEditing}
          sx={{
            position: 'absolute', top: 12, right: 12,
            color: editing ? '#ff6b81' : 'rgba(255,255,255,0.5)',
            '&:hover': { background: editing ? 'rgba(255,107,129,0.1)' : 'rgba(100,255,218,0.08)', color: editing ? '#ff6b81' : TEAL },
          }}
        >
          {editing ? <Close sx={{ fontSize: 20 }} /> : <Edit sx={{ fontSize: 20 }} />}
        </IconButton>

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
            <img src={currentAvatarSrc} alt="profile" style={{ width: '72%', height: '72%', objectFit: 'contain' }} />
          </Box>
        </Box>

        {/* Avatar picker — only while editing */}
        {editing && (
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, mb: 2 }}>
            {AVATAR_OPTIONS.map(opt => (
              <Box
                key={opt.id}
                onClick={() => setAvatarChoice(opt.id)}
                sx={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5,
                  cursor: 'pointer', p: 1, borderRadius: '12px',
                  border: `1px solid ${avatarChoice === opt.id ? TEAL : 'rgba(255,255,255,0.1)'}`,
                  background: avatarChoice === opt.id ? 'rgba(100,255,218,0.08)' : 'transparent',
                  transition: 'all 0.15s',
                }}
              >
                <Box sx={{
                  width: 44, height: 44, borderRadius: '50%', overflow: 'hidden',
                  background: '#0d1228', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <img src={opt.src} alt={opt.label} style={{ width: '72%', height: '72%', objectFit: 'contain' }} />
                </Box>
                <Typography sx={{ fontSize: '0.68rem', color: avatarChoice === opt.id ? TEAL : 'rgba(255,255,255,0.4)' }}>
                  {opt.label}
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        {editing ? (
          <TextField
            value={form.username}
            onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
            placeholder="Your name"
            size="small"
            error={!!errors.username}
            helperText={errors.username || ' '}
            sx={{ ...fieldSx, maxWidth: 260, mx: 'auto', '& input': { textAlign: 'center', fontWeight: 700, fontSize: '1.1rem' } }}
          />
        ) : (
          <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#e6f1ff' }}>
            {userData.username}
          </Typography>
        )}

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
      {userProfile && !editing && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
          <StatCard icon={<Star sx={{ fontSize: 18 }} />} label="Points" value={userProfile.Points ?? 0} color="#FFD700" />
          <StatCard icon={<School sx={{ fontSize: 18 }} />} label="Syllabus #" value={userProfile.syllbusNum ?? 0} color={BLUE} />
          <StatCard icon={<EmojiEvents sx={{ fontSize: 18 }} />} label="Res. Teachers" value={userProfile.resTeacherNum ?? 0} color={PURPLE} />
        </Box>
      )}

      {/* Contact info */}
      <Box sx={{ ...glassCard, p: { xs: 2.5, sm: 3 }, mt: 2 }}>
        <Typography sx={sectionLabel}>Contact Info</Typography>

        {editing ? (
          <>
            <EditRow
              icon={<Phone sx={{ fontSize: 17 }} />} label="Phone" color={BLUE}
              value={form.phone}
              onChange={v => setForm(f => ({ ...f, phone: sanitizePhoneInput(v) }))}
              error={errors.phone}
            />
            <EditRow
              icon={<LocationOn sx={{ fontSize: 17 }} />} label="Address" color={PURPLE}
              value={form.address} onChange={v => setForm(f => ({ ...f, address: v }))}
            />

            <Box sx={{ display: 'flex', gap: 1.5, mt: 1, px: 1.5 }}>
              <Box
                component="button"
                onClick={saveProfile}
                disabled={saving}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 0.75,
                  px: 2.5, py: 1, border: 'none', cursor: 'pointer',
                  borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem',
                  fontFamily: '"JetBrains Mono", monospace',
                  color: '#0d1228',
                  background: `linear-gradient(135deg, ${TEAL}, ${BLUE})`,
                  opacity: saving ? 0.6 : 1,
                  '&:hover': { opacity: saving ? 0.6 : 0.9 },
                }}
              >
                <Save sx={{ fontSize: 16 }} />
                {saving ? 'Saving...' : 'Save Changes'}
              </Box>
              <Box
                component="button"
                onClick={cancelEditing}
                sx={{
                  px: 2.5, py: 1, cursor: 'pointer',
                  borderRadius: '10px', fontSize: '0.85rem',
                  fontFamily: '"JetBrains Mono", monospace',
                  color: 'rgba(255,255,255,0.6)',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.15)',
                  '&:hover': { background: 'rgba(255,255,255,0.05)' },
                }}
              >
                Cancel
              </Box>
            </Box>
          </>
        ) : (
          <>
            <InfoRow icon={<Email sx={{ fontSize: 17 }} />} label="Email" value={userData.email} color={TEAL} />
            <InfoRow icon={<Phone sx={{ fontSize: 17 }} />} label="Phone" value={userData.phone} color={BLUE} />
            <InfoRow icon={<LocationOn sx={{ fontSize: 17 }} />} label="Address" value={userData.address} color={PURPLE} />
          </>
        )}
      </Box>

      {/* Email change — separate section, always visible (not just in edit mode),
          since it has its own verification flow independent of the main form */}
      <Box sx={{ ...glassCard, p: { xs: 2.5, sm: 3 }, mt: 2 }}>
        <Typography sx={sectionLabel}>Change Email</Typography>

        {pendingEmail ? (
          <Box sx={{
            p: 2, borderRadius: '10px',
            background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.2)',
          }}>
            <Typography sx={{ fontSize: '0.85rem', color: '#e6f1ff', mb: 1.5 }}>
              A verification link was sent to <strong>{pendingEmail}</strong>. Click it, then confirm below.
            </Typography>
            <Box
              component="button"
              onClick={confirmEmailVerified}
              disabled={checkingVerification}
              sx={{
                display: 'flex', alignItems: 'center', gap: 0.75,
                px: 2, py: 0.9, border: 'none', cursor: 'pointer',
                borderRadius: '10px', fontWeight: 700, fontSize: '0.8rem',
                fontFamily: '"JetBrains Mono", monospace',
                color: '#0d1228',
                background: `linear-gradient(135deg, ${TEAL}, ${BLUE})`,
                opacity: checkingVerification ? 0.6 : 1,
              }}
            >
              <CheckCircle sx={{ fontSize: 15 }} />
              {checkingVerification ? 'Checking...' : "I've verified — sync now"}
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <TextField
              value={newEmail}
              onChange={e => { setNewEmail(e.target.value); setEmailError(''); }}
              placeholder="new@email.com"
              size="small"
              error={!!emailError}
              helperText={emailError || 'A verification link will be sent to this address'}
              sx={{
                flex: 1, minWidth: 220, ...fieldSx,
                '& .MuiFormHelperText-root': { fontSize: '0.7rem', color: emailError ? undefined : 'rgba(255,255,255,0.35)' },
              }}
            />
            <Box
              component="button"
              onClick={sendEmailVerification}
              disabled={sendingVerification || !newEmail}
              sx={{
                px: 2.5, py: 1, border: 'none', cursor: 'pointer', flexShrink: 0,
                borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem',
                fontFamily: '"JetBrains Mono", monospace',
                color: '#0d1228',
                background: `linear-gradient(135deg, ${PURPLE}, ${BLUE})`,
                opacity: (sendingVerification || !newEmail) ? 0.5 : 1,
              }}
            >
              {sendingVerification ? 'Sending...' : 'Send Verification'}
            </Box>
          </Box>
        )}
      </Box>

      {/* Academic info */}
      {userProfile && !editing && (
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