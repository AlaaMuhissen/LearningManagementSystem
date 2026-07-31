import { useState } from 'react';
import API_URL from '../../config/api.js';
import { auth } from '../../config/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
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

export default function LoginWithGmail() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [pendingUserId, setPendingUserId] = useState(null); // set once a NEW account is created
  const [avatarChoice, setAvatarChoice] = useState('boy');

  const signIn = async () => {
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const idToken = await user.getIdToken();

      // Check if user exists in DB
      const res = await fetch(`${API_URL}/api/students/getStudent/${encodeURIComponent(user.email)}`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const data = res.ok ? await safeJson(res) : null;

      if (data) {
        // Existing user
        if (data.role === 'teacher' || data.role === 'admin') {
          navigate('/teacher-dashboard');
        } else {
          navigate('/dashboard');
        }
        return;
      }

      if (res.status !== 404) {
        // Something other than "not found" — e.g. a 401 auth rejection.
        // Don't treat this as "new user", that would attempt to create a
        // duplicate account for someone who actually already exists.
        console.error('Unexpected response checking for existing student:', res.status);
        setError('Something went wrong signing in. Please try again.');
        return;
      }

      // New user — create them, and actually confirm it worked before navigating
      const createRes = await fetch(`${API_URL}/api/students/addNewStudent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user.displayName || user.email.split('@')[0],
          email: user.email,
          password: 'google-auth',
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
        navigate('/dashboard'); // no id came back — nothing to key the avatar choice on, just proceed
      }
    } catch (error) {
      console.error('Error signing in with Google:', error.message);
      setError('Something went wrong signing in with Google. Please try again.');
    }
  };

  const finishSignup = () => {
    window.localStorage.setItem(`avatar_pref_${pendingUserId}`, avatarChoice);
    navigate('/dashboard');
  };

  return (
    <>
      <button className="social-btn" onClick={signIn} type="button">
        <svg width="18" height="18" viewBox="0 0 18 18">
          <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
          <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
          <path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z" fill="#FBBC05"/>
          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
        </svg>
        Continue with Google
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