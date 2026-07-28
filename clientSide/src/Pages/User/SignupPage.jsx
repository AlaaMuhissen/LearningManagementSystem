import { useState, useEffect, useRef } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { useNavigate, Link } from 'react-router-dom';
import API_URL from '../../config/api.js';
import LoginWithGmail from '../../Components/Login/LoginWithGmail';
import LoginWithFacebook from '../../Components/Login/LoginWithFacebook';
import '../../styles/login.css';

function SignUpPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '', phone: '', address: '' });
  const [step, setStep] = useState(1); // 2-step form
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animFrame;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const symbols = ['</>', '{...}', '=>', '[ ]', '&&', '++', 'fn()', 'let', 'class', '==='];
    const particles = Array.from({ length: 20 }, () => ({
      x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
      vy: -(0.3 + Math.random() * 0.6), vx: (Math.random() - 0.5) * 0.3,
      sym: symbols[Math.floor(Math.random() * symbols.length)],
      size: 11 + Math.random() * 8, opacity: 0.06 + Math.random() * 0.1,
      color: Math.random() > 0.5 ? '#64ffda' : '#a78bfa',
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.globalAlpha = p.opacity; ctx.fillStyle = p.color;
        ctx.font = `${p.size}px monospace`; ctx.fillText(p.sym, p.x, p.y);
        p.y += p.vy; p.x += p.vx;
        if (p.y < -30) { p.y = canvas.height + 30; p.x = Math.random() * canvas.width; }
      });
      ctx.globalAlpha = 1;
      animFrame = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animFrame); window.removeEventListener('resize', resize); };
  }, []);

  const update = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const handleNext = (e) => {
    e.preventDefault();
    if (!form.username.trim()) return setError('Enter your name');
    if (!form.email.includes('@')) return setError('Enter a valid email');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    if (form.password !== form.confirm) return setError("Passwords don't match");
    setError('');
    setStep(2);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Create Firebase user
      await createUserWithEmailAndPassword(auth, form.email, form.password);
      // Create user in DB
      await fetch(`${API_URL}/api/students/addNewStudent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: 'firebase-auth',
          phone: form.phone,
          address: form.address,
          role: 'student',
        }),
      });
      navigate('/dashboard');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Try logging in!');
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      <canvas ref={canvasRef} className="login-canvas" />
      <div className="login-grid" />
      <div className="orb orb-1" style={{ background: 'rgba(167,139,250,0.08)' }} />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div className="login-card" style={{ maxWidth: 440 }}>
        {/* Logo */}
        <div className="login-logo">
          <div className="logo-icon"><span>🚀</span></div>
          <h1 className="logo-title">Join CodeQuest</h1>
          <p className="logo-sub">Create your free account and start learning</p>
        </div>

        {/* Step indicator */}
        <div className="step-indicator">
          <div className={`step-dot ${step >= 1 ? 'active' : ''}`}>1</div>
          <div className="step-line" />
          <div className={`step-dot ${step >= 2 ? 'active' : ''}`}>2</div>
        </div>

        {/* Step 1 — account info */}
        {step === 1 && (
          <form onSubmit={handleNext} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div className="field-group">
              <label className="field-label">Your Name</label>
              <div className="field-wrap">
                <span className="field-icon">👤</span>
                <input className="field-input" type="text" placeholder="e.g. Sarah" value={form.username} onChange={e => update('username', e.target.value)} required />
              </div>
            </div>
            <div className="field-group">
              <label className="field-label">Email</label>
              <div className="field-wrap">
                <span className="field-icon">📧</span>
                <input className="field-input" type="email" placeholder="your@email.com" value={form.email} onChange={e => update('email', e.target.value)} required />
              </div>
            </div>
            <div className="field-group">
              <label className="field-label">Password</label>
              <div className="field-wrap">
                <span className="field-icon">🔒</span>
                <input className="field-input" type="password" placeholder="At least 6 characters" value={form.password} onChange={e => update('password', e.target.value)} required />
              </div>
            </div>
            <div className="field-group">
              <label className="field-label">Confirm Password</label>
              <div className="field-wrap">
                <span className="field-icon">✅</span>
                <input className="field-input" type="password" placeholder="Same password again" value={form.confirm} onChange={e => update('confirm', e.target.value)} required />
              </div>
            </div>
            {error && <div className="login-error">⚠️ {error}</div>}
            <button type="submit" className="login-btn">Continue →</button>

            <div className="login-divider">
              <span className="divider-line" /><span className="divider-text">or sign up with</span><span className="divider-line" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <LoginWithGmail />
              <LoginWithFacebook />
            </div>
          </form>
        )}

        {/* Step 2 — optional profile */}
        {step === 2 && (
          <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <p className="step-hint">Optional — you can skip these anytime</p>
            <div className="field-group">
              <label className="field-label">Phone (optional)</label>
              <div className="field-wrap">
                <span className="field-icon">📱</span>
                <input className="field-input" type="tel" placeholder="+972 50 000 0000" value={form.phone} onChange={e => update('phone', e.target.value)} />
              </div>
            </div>
            <div className="field-group">
              <label className="field-label">City (optional)</label>
              <div className="field-wrap">
                <span className="field-icon">🏙️</span>
                <input className="field-input" type="text" placeholder="e.g. Jerusalem" value={form.address} onChange={e => update('address', e.target.value)} />
              </div>
            </div>
            {error && <div className="login-error">⚠️ {error}</div>}
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? '🚀 Creating account...' : '🎉 Create My Account!'}
            </button>
            <button type="button" className="login-btn-skip" onClick={() => setStep(1)}>← Back</button>
          </form>
        )}

        <p className="login-footer">
          Already have an account? <Link to="/" className="login-link">Sign in →</Link>
        </p>
      </div>
    </div>
  );
}

export default SignUpPage;