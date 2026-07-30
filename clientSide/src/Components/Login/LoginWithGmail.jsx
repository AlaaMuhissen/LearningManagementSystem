import { useState } from 'react';
import API_URL from '../../config/api.js';
import { auth } from '../../config/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

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

  const signIn = async () => {
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user exists in DB
      const res = await fetch(`${API_URL}/api/students/getStudent/${encodeURIComponent(user.email)}`);
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

      navigate('/dashboard');
    } catch (error) {
      console.error('Error signing in with Google:', error.message);
      setError('Something went wrong signing in with Google. Please try again.');
    }
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
    </>
  );
}