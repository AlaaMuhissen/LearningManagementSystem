import { useState } from 'react';
import { auth } from '../../config/firebase';
import { signInWithPopup, FacebookAuthProvider } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import API_URL from '../../config/api.js';
import BoyAvatar from '/boy.png';
import GirlAvatar from '/girl.png';

const AVATAR_OPTIONS = [
  { id: 'boy', label: 'Boy', src: BoyAvatar },
  { id: 'girl', label: 'Girl', src: GirlAvatar },
];

// Safely parse a fetch Response as JSON without crashing on an empty body
// (e.g. a 200 with no content, which throws "Unexpected end of JSON input"
// if you call response.json() directly on it).
async function safeJson(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export default function LoginWithFacebook() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [pendingUserId, setPendingUserId] = useState(null); // set once a NEW account is created
  const [avatarChoice, setAvatarChoice] = useState('boy');

  const signIn = async () => {
    setError('');
    try {
      const provider = new FacebookAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const idToken = await user.getIdToken();

      const res = await fetch(`${API_URL}/api/students/getStudent/${encodeURIComponent(user.email)}`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const data = res.ok ? await safeJson(res) : null;

      if (data) {
        // Existing user
        navigate(data.role === 'teacher' ? '/teacher-dashboard' : '/dashboard');
        return;
      }

      if (res.status !== 404) {
        console.error('Unexpected response checking for existing student:', res.status);
        setError('Something went wrong signing in. Please try again.');
        return;
      }

      // New user — create them, and confirm it worked before navigating
      const createRes = await fetch(`${API_URL}/api/students/addNewStudent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user.displayName || user.email.split('@')[0],
          email: user.email,
          password: 'facebook-auth',
          phone: '',
          address: '',
          role: 'student',
        }),
      });

      if (!createRes.ok) {
        const errBody = await safeJson(createRes);
        console.error('Failed to create student record:', createRes.status, errBody);
        setError("Couldn't finish setting up your account. Please try again in a moment.");
        return;
      }

      // Don't navigate yet — show the avatar picker for this brand-new account
      const created = await safeJson(createRes);
      if (created?.id) {
        setPendingUserId(created.id);
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error signing in with Facebook:', error.message);
      setError('Something went wrong signing in with Facebook. Please try again.');
    }
  };

  const finishSignup = () => {
    window.localStorage.setItem(`avatar_pref_${pendingUserId}`, avatarChoice);
    navigate('/dashboard');
  };

  return (
    <>
      <button className="social-btn social-btn-fb" onClick={signIn} type="button">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
        Continue with Facebook
      </button>
      {error && <div className="login-error">⚠️ {error}</div>}

      {/* Avatar picker modal — only shown right after a brand-new account is created */}
      {pendingUserId && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 2000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(5,8,20,0.75)', backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            width: 320, padding: 28, borderRadius: 20, textAlign: 'center',
            background: 'linear-gradient(160deg, #131a3a 0%, #0d1228 100%)',
            border: '1px solid rgba(100,255,218,0.15)',
          }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#e6f1ff', marginBottom: 4 }}>
              Welcome! 🎉
            </div>
            <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.4)', marginBottom: 18 }}>
              Choose your avatar to get started
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginBottom: 20 }}>
              {AVATAR_OPTIONS.map(opt => (
                <div
                  key={opt.id}
                  onClick={() => setAvatarChoice(opt.id)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    cursor: 'pointer', padding: 10, borderRadius: 12,
                    border: `1px solid ${avatarChoice === opt.id ? '#64ffda' : 'rgba(255,255,255,0.12)'}`,
                    background: avatarChoice === opt.id ? 'rgba(100,255,218,0.08)' : 'rgba(255,255,255,0.02)',
                  }}
                >
                  <div style={{
                    width: 52, height: 52, borderRadius: '50%', overflow: 'hidden',
                    background: '#0d1228', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <img src={opt.src} alt={opt.label} style={{ width: '72%', height: '72%', objectFit: 'contain' }} />
                  </div>
                  <span style={{ fontSize: 12, color: avatarChoice === opt.id ? '#64ffda' : 'rgba(255,255,255,0.5)' }}>
                    {opt.label}
                  </span>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={finishSignup}
              style={{
                width: '100%', padding: '10px 0', border: 'none', cursor: 'pointer',
                borderRadius: 10, fontWeight: 700, fontSize: 13.5,
                color: '#0d1228', background: 'linear-gradient(135deg, #64ffda, #4fc3f7)',
              }}
            >
              Continue →
            </button>
          </div>
        </div>
      )}
    </>
  );
}