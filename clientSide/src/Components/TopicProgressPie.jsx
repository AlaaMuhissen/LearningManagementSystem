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
  default: { emoji: '💻', color: '#4fc3f7' },
};

const TopicProgressPie = ({ syllabus_id, language_id, languageName }) => {
  const [TopicData, setTopicData] = useState([]);
  const [TopicProgressData, setTopicProgressData] = useState([]);
  const { userData } = useAuth();
  const studentId = userData?.id;
  const [percentage, setPercentage] = useState(0);

  const fetchTopicProgressData = async () => {
    try {
      if (studentId) {
        const response = await fetch(`${API_URL}/api/progress/getTopicProgress/${studentId}/${syllabus_id}/${language_id}`);
        const data = await response.json();
        setTopicProgressData(data);
      }
    } catch (error) {
      console.error('Error fetching progress data:', error);
    }
  };

  const fetchTopicsData = async () => {
    try {
      if (studentId) {
        const response = await fetch(`${API_URL}/api/topics/getTopicsBasedOnSyllabusId/${syllabus_id}`);
        const data = await response.json();
        // Filter by language_id
        setTopicData(data.filter(t => t.language_id === language_id));
      }
    } catch (error) {
      console.error('Error fetching topics data:', error);
    }
  };

  useEffect(() => {
    fetchTopicsData();
    fetchTopicProgressData();
  }, [language_id]);

  useEffect(() => {
    if (TopicProgressData.length > 0 && TopicData.length > 0) {
      const completedTopics = TopicProgressData.filter(item => item.completed === true).length;
      const totalTopics = TopicData.length;
      setPercentage(Math.round((completedTopics / totalTopics) * 100));
    }
  }, [TopicData, TopicProgressData]);

  const cfg = LANG_CONFIG[languageName?.toLowerCase()] || LANG_CONFIG.default;
  const completedCount = TopicProgressData?.filter(item => item.completed === true).length || 0;

  return (
    <>
      {!TopicProgressData || TopicProgressData.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 min-w-[140px] flex-shrink-0 rounded-2xl p-4 bg-white/[0.02] border border-white/[0.06]">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg opacity-40"
            style={{ background: `${cfg.color}1f`, border: `1px solid ${cfg.color}55` }}
          >
            {cfg.emoji}
          </div>
          <h4 className="text-xs text-white/40 text-center mt-1">Start {languageName} to see progress</h4>
        </div>
      ) : (
        <div
          className="group relative flex flex-col items-center gap-3 p-4 rounded-2xl min-w-[140px] flex-shrink-0
                     bg-white/[0.02] border border-white/[0.06]
                     transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.04]"
        >
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ boxShadow: `0 0 24px -4px ${cfg.color}66` }}
          />

          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
            style={{ background: `${cfg.color}1f`, border: `1px solid ${cfg.color}55` }}
          >
            {cfg.emoji}
          </div>

          <div className="w-24 h-24">
            <CircularProgressbar
              value={percentage}
              strokeWidth={9}
              text={`${percentage}%`}
              styles={buildStyles({
                rotation: 0.5 + (1 - percentage / 100) / 2,
                textSize: '20px',
                pathColor: cfg.color,
                trailColor: 'rgba(255,255,255,0.07)',
                textColor: '#e6f1ff',
                strokeLinecap: 'round',
                pathTransitionDuration: 0.6,
              })}
            />
          </div>

          <div className="text-center">
            <h4 className="text-xs font-bold uppercase tracking-wide" style={{ color: cfg.color }}>
              {languageName}
            </h4>
            <p className="text-[10px] text-white/35 mt-0.5">
              {completedCount}/{TopicData.length} topics
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default TopicProgressPie;