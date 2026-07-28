import { useNavigate } from 'react-router-dom';
import './Card.css';

const LANG_CONFIG = {
  html:       { emoji: '🌐', sub: 'Build web pages',      color1: '#e44d26', color2: '#f16529', glow: 'rgba(228,77,38,0.35)',   textColor: '#f16529' },
  css:        { emoji: '🎨', sub: 'Style the web',        color1: '#264de4', color2: '#2965f1', glow: 'rgba(38,77,228,0.35)',    textColor: '#4fc3f7' },
  javascript: { emoji: '⚡', sub: 'Make it interactive',  color1: '#c9a800', color2: '#f7df1e', glow: 'rgba(247,223,30,0.3)',    textColor: '#f7df1e' },
  js:         { emoji: '⚡', sub: 'Make it interactive',  color1: '#c9a800', color2: '#f7df1e', glow: 'rgba(247,223,30,0.3)',    textColor: '#f7df1e' },
  python:     { emoji: '🐍', sub: 'Data & automation',    color1: '#3776ab', color2: '#ffd43b', glow: 'rgba(55,118,171,0.4)',    textColor: '#4fc3f7' },
  java:       { emoji: '☕', sub: 'Power your apps',      color1: '#f89820', color2: '#e76f00', glow: 'rgba(248,152,32,0.35)',   textColor: '#f89820' },
  default:    { emoji: '💻', sub: 'Start learning',       color1: '#64ffda', color2: '#4fc3f7', glow: 'rgba(100,255,218,0.35)',  textColor: '#64ffda' },
};

export default function LanguageCard({ title, syllabusId }) {
  const navigate = useNavigate();
  const key = title?.toLowerCase();
  const cfg = LANG_CONFIG[key] || LANG_CONFIG.default;

  const pieceStyle = {
    '--c1': cfg.color1,
    '--c2': cfg.color2,
    '--glow': cfg.glow,
  };

  return (
    <div
      className="puzzle-card"
      style={pieceStyle}
      onClick={() => navigate(`/dashboard/${syllabusId}/${title}`)}
    >
      
      {/* SVG puzzle shape */}
      <svg className="puzzle-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={`g-${key}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={cfg.color1} />
            <stop offset="100%" stopColor={cfg.color2} />
          </linearGradient>
          <filter id={`shadow-${key}`}>
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor={cfg.color1} floodOpacity="0.4" />
          </filter>
        </defs>
        {/* Puzzle piece path — real interlocking shape */}
        <path
          d="
            M 30 30
            Q 30 20, 40 20
            L 78 20
            C 78 5, 92 0, 100 0
            C 108 0, 122 5, 122 20
            L 160 20
            Q 170 20, 170 30
            L 170 78
            C 185 78, 190 92, 190 100
            C 190 108, 185 122, 170 122
            L 170 160
            Q 170 170, 160 170
            L 122 170
            C 122 185, 108 190, 100 190
            C 92 190, 78 185, 78 170
            L 40 170
            Q 30 170, 30 160
            L 30 122
            C 15 122, 10 108, 10 100
            C 10 92, 15 78, 30 78
            Z
          "
          fill={`url(#g-${key})`}
          filter={`url(#shadow-${key})`}
        />
        <path
          d="M 50 30 L 50 95 C 35 95, 30 105, 50 110 L 50 150 L 150 75 Z"
          fill="rgba(255,255,255,0.07)"
        />
      </svg>

      {/* Emoji icon overlay */}
      <div className="puzzle-emoji">{cfg.emoji}</div>

      {/* Label */}
      <div className="puzzle-label">
        <div className="puzzle-name" style={{ color: cfg.textColor }}>
          {title?.toUpperCase()}
        </div>
        <div className="puzzle-sub">{cfg.sub}</div>
      </div>

      {/* Glow bg */}
      <div className="puzzle-glow" />
    </div>
  );
}