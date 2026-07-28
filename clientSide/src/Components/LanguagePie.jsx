import API_URL from '../config/api.js';
import { useState, useEffect } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useAuth } from '../Components/Login/AuthContext';

const LANG_CONFIG = {
  html: { emoji: '🌐', color: '#f16529' },
  css: { emoji: '🎨', color: '#4fc3f7' },
  javascript: { emoji: '⚡', color: '#f7df1e' },
  python: { emoji: '🐍', color: '#64ffda' },
  java: { emoji: '☕', color: '#a78bfa' },
  default: { emoji: '💻', color: '#64ffda' },
};

function LanguagePie({ syllabus_id }) {
  const [pieData, setPieData] = useState([]);
  const { userData } = useAuth();
  const studentId = userData?.id;

  useEffect(() => {
    if (!studentId) return;

    const fetchData = async () => {
      try {
        // Get all language names
        const lanRes = await fetch(`${API_URL}/api/syllabus/getLanguagesNameFromSyllabus/${syllabus_id}`);
        const lanData = await lanRes.json();

        // Get all topics
        const topicsRes = await fetch(`${API_URL}/api/topics/getTopicsBasedOnSyllabusId/${syllabus_id}`);
        const topicsData = await topicsRes.json();

        // Get topic progress
        const results = await Promise.all(
          lanData.map(async (lan, index) => {
            const langId = index + 1;
            const progRes = await fetch(`${API_URL}/api/progress/getTopicProgress/${studentId}/${syllabus_id}/${langId}`);
            const progData = await progRes.json();

            const totalTopics = topicsData.filter(t => t.language_id === langId).length;
            const completedTopics = progData.filter(t => t.completed === true).length;
            const value = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

            return { name: lan.lanName, value, completedTopics, totalTopics };
          })
        );
        setPieData(results);
      } catch (error) {
        console.error('Error fetching language progress:', error);
      }
    };

    fetchData();
  }, [studentId, syllabus_id]);

  return (
    <div className='flex flex-wrap justify-center gap-4'>
      {pieData.map((lan, index) => {
        const cfg = LANG_CONFIG[lan.name?.toLowerCase()] || LANG_CONFIG.default;
        return (
          <div
            key={index}
            className="group relative flex flex-col items-center gap-3 p-4 rounded-2xl w-32
                       bg-white/[0.02] border border-white/[0.06]
                       transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.04]"
            style={{ '--glow': cfg.color }}
          >
            {/* Glow on hover */}
            <div
              className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ boxShadow: `0 0 24px -4px ${cfg.color}66` }}
            />

            {/* Icon badge */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
              style={{ background: `${cfg.color}1f`, border: `1px solid ${cfg.color}55` }}
            >
              {cfg.emoji}
            </div>

            <div className="relative w-20 h-20">
              <CircularProgressbar
                value={lan.value}
                text={`${lan.value}%`}
                circleRatio={0.8}
                strokeWidth={9}
                styles={buildStyles({
                  rotation: 1 / 2 + 1 / 10,
                  strokeLinecap: 'round',
                  trailColor: 'rgba(255,255,255,0.07)',
                  pathColor: cfg.color,
                  textColor: '#e6f1ff',
                  textSize: '22px',
                  pathTransitionDuration: 0.6,
                })}
              />
            </div>

            <div className="text-center">
              <h4 className="text-xs font-bold uppercase tracking-wide" style={{ color: cfg.color }}>
                {lan.name}
              </h4>
              <p className="text-[10px] text-white/35 mt-0.5">
                {lan.completedTopics}/{lan.totalTopics} topics
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default LanguagePie;