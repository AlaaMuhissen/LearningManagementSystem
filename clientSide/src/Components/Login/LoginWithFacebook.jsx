import { useState } from 'react';
import { auth } from '../../config/firebase';
import { signInWithPopup, FacebookAuthProvider } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import API_URL from '../../config/api.js';

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

  const signIn = async () => {
    setError('');
    try {
      const provider = new FacebookAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const res = await fetch(`${API_URL}/api/students/getStudent/${encodeURIComponent(user.email)}`);
      const data = res.ok ? await safeJson(res) : null;

      if (data) {
        // Existing user
        navigate(data.role === 'teacher' ? '/teacher-dashboard' : '/dashboard');
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

      navigate('/dashboard');
    } catch (error) {
      console.error('Error signing in with Facebook:', error.message);
      setError('Something went wrong signing in with Facebook. Please try again.');
    }
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
    </>
  );
}