import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DeviceFrameset } from 'react-device-frameset';
import 'react-device-frameset/styles/marvel-devices.min.css';
import '../../styles/phone.css';

function Phone({ resultHtml, onClose }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [showToast, setShowToast] = useState(false);

  const getCurrentTime = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
  };

  useEffect(() => {
    // Show custom toast after short delay
    const t = setTimeout(() => setShowToast(true), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="phone-overlay">
      {/* Backdrop */}
      <div className="phone-backdrop" onClick={onClose} />

      {/* Toast rendered at body level via portal — above everything including z-index stacking */}
      {showToast && createPortal(
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 999999,
          background: 'linear-gradient(135deg, #1a2a1a, #0d1d0d)',
          border: '1px solid #4ade80',
          borderRadius: '14px',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 8px 32px rgba(74,222,128,0.3)',
          minWidth: '280px',
          animation: 'slideDown 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
          <span style={{ fontSize: '24px' }}>🎉</span>
          <span style={{ color: '#4ade80', fontWeight: 700, fontSize: '15px', flex: 1 }}>
            Correct! Your code is live!
          </span>
          <button
            onClick={() => setShowToast(false)}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '28px', height: '28px',
              color: '#fff', cursor: 'pointer',
              fontSize: '14px', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}
          >✕</button>
          <style>{`@keyframes slideDown { from { opacity:0; transform: translateX(-50%) translateY(-20px); } to { opacity:1; transform: translateX(-50%) translateY(0); } }`}</style>
        </div>,
        document.body
      )}

      {/* Header row: success banner + X button */}
      <div className="phone-topbar">
        <div className="phone-success-banner">
          <span className="phone-success-icon">📱</span>
          <div>
            <div className="phone-success-title">Live Preview</div>
            <div className="phone-success-sub">See your code running in the browser</div>
          </div>
        </div>
        <button className="phone-close-btn" onClick={onClose} title="Close and continue">
          ✕ Next
        </button>
      </div>

      {/* Device */}
      <div className="phone-device-wrap">
        <DeviceFrameset device="iPhone X" color="gold" zoom="50%">
          <div className="phone-screen">
            {/* Status bar */}
            <div className="phone-statusbar">
              <span className="phone-time">{getCurrentTime()}</span>
              <div className="phone-statusicons">
                <span>📶</span>
                <span>🔋</span>
              </div>
            </div>

            {/* Browser bar */}
            <div className="phone-browserbar">
              <div className="phone-urlbar">
                <span className="phone-lock">🔒</span>
                <span className="phone-url">mywebsite.com</span>
                <button
                  className="phone-refresh"
                  onClick={() => setRefreshKey(k => k + 1)}
                  title="Reload"
                >↻</button>
              </div>
            </div>

            {/* Live iframe — resultHtml is already a full HTML document */}
            <iframe
              key={refreshKey}
              srcDoc={resultHtml}
              title="live-preview"
              style={{
                flex: 1,
                width: '100%',
                border: 'none',
                background: '#fff',
                display: 'block',
              }}
              sandbox="allow-scripts allow-same-origin allow-forms"
            />

            {/* Bottom nav */}
            <div className="phone-bottomnav">
              <button className="phone-navbtn">◀</button>
              <button className="phone-navbtn">▶</button>
              <button className="phone-navbtn">⌂</button>
              <button className="phone-navbtn">⊡</button>
            </div>
          </div>
        </DeviceFrameset>
      </div>
    </div>
  );
}

export default Phone;