import API_URL from '../../config/api.js';
import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { useNavigate } from 'react-router-dom';

export default function LoginWithEmail() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchUserRole = async (email) => {
    try {
      const response = await fetch(`${API_URL}/api/students/getStudent/${encodeURIComponent(email)}`);
      if (response.ok) {
        const data = await response.json();
        return data.role;
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
    return 'student';
  };

  // const refreshIdToken = async () => {
  //   const user = auth.currentUser;
  //   if (user) return await user.getIdToken(true);
  // };

  const signIn = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const role = await fetchUserRole(userCredential.user.email);
      if (role === 'teacher' || role === 'admin') {
        navigate('/teacher-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error(error.message);
      setError('Wrong email or password. Try again!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={signIn} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <div className="field-group">
        <label className="field-label">Email</label>
        <div className="field-wrap">
          <span className="field-icon">📧</span>
          <input
            type="email"
            placeholder="your@email.com"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="field-input"
          />
        </div>
      </div>

      <div className="field-group">
        <label className="field-label">Password</label>
        <div className="field-wrap">
          <span className="field-icon">🔒</span>
          <input
            type="password"
            placeholder="••••••••"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="field-input"
          />
        </div>
      </div>

      {error && (
        <div className="login-error">
          ⚠️ {error}
        </div>
      )}

      <button type="submit" className="login-btn" disabled={loading}>
        {loading ? '🚀 Launching...' : '🚀 Start Coding!'}
      </button>
    </form>
  );
}