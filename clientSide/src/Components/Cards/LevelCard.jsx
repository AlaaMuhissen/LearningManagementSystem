import API_URL from '../../config/api.js';
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../Login/AuthContext';
import { useTopics } from '../TopicsContext';
import '../../styles/levelCard.css';

function LevelCard({ syllabusId, language, topic, levelNumber, levelConfig }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [levelStatus, setLevelStatus] = useState(false);
  const [currQuestion, setCurrQuestion] = useState(0);
  const [totalQuestion, setTotalQuestion] = useState(0);
  const [prevLevelCompleted, setPrevLevelCompleted] = useState(false);
  const { userData } = useAuth();
  const studentId = userData?.id;
  const topics = useTopics();
  const topicData = topics.find(top => top.topic_name === topic);

  const cfg = levelConfig || { label: `Level ${levelNumber}`, emoji: '🎯', color: '#64ffda', desc: '' };
  const isLocked = levelNumber !== 1 && !prevLevelCompleted;

  const handleClick = () => {
    if (isLocked) return;
    navigate(`/dashboard/${syllabusId}/${language}/${topic}/levels/${levelNumber}/challenges`);
  };

  const fetchLevelsProgressData = async () => {
    try {
      if (!studentId || !topicData) return;
      const res = await fetch(`${API_URL}/api/progress/getLevelStatus/${syllabusId}/${topicData.language_id}/${topicData.topic_name}/${levelNumber}/${studentId}`);
      const data = await res.json();
      setLevelStatus(data.isTopicCompleted);
      setCurrQuestion(data.currQuestion ?? 0);

      if (levelNumber > 1) {
        const prevRes = await fetch(`${API_URL}/api/progress/getLevelStatus/${syllabusId}/${topicData.language_id}/${topicData.topic_name}/${levelNumber - 1}/${studentId}`);
        const prevData = await prevRes.json();
        setPrevLevelCompleted(prevData.isTopicCompleted);
      }
    } catch (err) { console.error(err); }
  };

  const fetchQuestionNum = async () => {
    try {
      if (!studentId || !topicData) return;
      const res = await fetch(`${API_URL}/api/progress/getQuestionNum/${syllabusId}/${topicData?.language_id}/${topicData?.id}/${levelNumber}`);
      const data = await res.json();
      setTotalQuestion(data.questionsNum);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchLevelsProgressData();
    fetchQuestionNum();
  }, [studentId, topicData, location]);

  const progress = totalQuestion > 0 ? Math.round((currQuestion / totalQuestion) * 100) : 0;

  return (
    <div
      className={`level-card ${isLocked ? 'level-locked' : ''} ${levelStatus ? 'level-done' : ''}`}
      style={{ '--level-color': cfg.color }}
      onClick={handleClick}
    >
      {/* Level number badge */}
      <div className="level-badge">
        {isLocked ? '🔒' : levelStatus ? '✅' : cfg.emoji}
      </div>

      {/* Content */}
      <div className="level-body">
        <div className="level-number">Level {levelNumber}</div>
        <div className="level-label">{cfg.label}</div>
        <div className="level-desc">{cfg.desc}</div>
      </div>

      {/* Progress bar */}
      {!isLocked && totalQuestion > 0 && (
        <div className="level-progress-wrap">
          <div className="level-progress-bar">
            <div
              className="level-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="level-progress-label">
            {currQuestion} / {totalQuestion}
          </div>
        </div>
      )}

      {/* CTA */}
      {!isLocked && (
        <div className="level-cta">
          {levelStatus ? 'Replay →' : currQuestion > 0 ? 'Continue →' : 'Start →'}
        </div>
      )}

      {/* Glow */}
      <div className="level-glow" />
    </div>
  );
}

export default LevelCard;