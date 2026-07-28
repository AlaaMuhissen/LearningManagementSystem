import { useEffect, useRef } from 'react';
import LoginWithEmail from '../../Components/Login/LoginWithEmail';
import LoginWithGmail from '../../Components/Login/LoginWithGmail';
import '../../styles/login.css';

function LoginPage() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animFrame;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Floating code particles
    const symbols = ['</>', '{...}', '=>', '[ ]', '&&', '++', '!==', 'fn()', 'let', 'if', 'for', 'class', '===', '||'];
    const particles = Array.from({ length: 28 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vy: -(0.3 + Math.random() * 0.6),
      vx: (Math.random() - 0.5) * 0.3,
      sym: symbols[Math.floor(Math.random() * symbols.length)],
      size: 11 + Math.random() * 8,
      opacity: 0.06 + Math.random() * 0.1,
      color: Math.random() > 0.5 ? '#64ffda' : '#4fc3f7',
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.font = `${p.size}px monospace`;
        ctx.fillText(p.sym, p.x, p.y);
        p.y += p.vy;
        p.x += p.vx;
        if (p.y < -30) { p.y = canvas.height + 30; p.x = Math.random() * canvas.width; }
        if (p.x < -60 || p.x > canvas.width + 60) p.vx *= -1;
      });
      ctx.globalAlpha = 1;
      animFrame = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="login-root">
      {/* Animated bg */}
      <canvas ref={canvasRef} className="login-canvas" />
      <div className="login-grid" />

      {/* Floating glow orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* XP badge */}
      <div className="xp-badge">
        <span className="xp-icon">⚡</span>
        Learn to code. Level up!
      </div>

      {/* Card */}
      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <div className="logo-icon">
            <span>💻</span>
          </div>
          <h1 className="logo-title">CodeQuest</h1>
          <p className="logo-sub">Your coding adventure starts here</p>
        </div>

        {/* Form */}
        <div className="login-form">
          <LoginWithEmail />

          <div className="login-divider">
            <span className="divider-line" />
            <span className="divider-text">or</span>
            <span className="divider-line" />
          </div>

          <LoginWithGmail />
        </div>

        {/* Footer */}
        <p className="login-footer">
          New here? <a href="/signup" className="login-link">Create free account →</a>
        </p>

        {/* Achievement dots */}
        <div className="achievement-row">
          <span className="achievement">🏆 Top Student</span>
          <span className="achievement">🔥 7-day streak</span>
          <span className="achievement">⭐ 170 XP</span>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;