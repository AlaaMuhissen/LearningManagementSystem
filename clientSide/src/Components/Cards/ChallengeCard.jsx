import API_URL from '../../config/api.js';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTopics } from '../TopicsContext';
import { useAuth } from '../Login/AuthContext';
import '../../styles/challengecard.css';

function ChallengeCard({ questionNum, levelColor }) {
  const navigate = useNavigate();
  const { syllabusId, topic, levelNum } = useParams();
  const [status, setStatus] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const topics = useTopics();
  const { userData } = useAuth();
  const studentId = userData?.id;
  const topicData = topics.find(top => top.topic_name === topic);
  const color = levelColor || '#64ffda';

  const handleClick = () => {
    if (!status) return;
    navigate(`${questionNum}`);
  };

  const fetchData = async () => {
    try {
      if (!topicData || !studentId) return;

      const progressRes = await fetch(
        `${API_URL}/api/progress/getLevelStatus/${syllabusId}/${topicData.language_id}/${topicData.topic_name}/${levelNum}/${studentId}`
      );
      const progressData = await progressRes.json();
      const currQuestion = progressData.currQuestion ?? 0;
      const completed = progressData.isTopicCompleted === true;

      setIsCompleted(completed || questionNum <= currQuestion);
      setStatus(completed || questionNum <= currQuestion + 1);
    } catch (error) {
      console.error('Error fetching challenge data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [topicData, studentId]);

  return (
    <div
      className={`challenge-card ${!status ? 'challenge-locked' : ''} ${isCompleted ? 'challenge-done' : ''}`}
      style={{ '--ch-color': color }}
      onClick={handleClick}
    >
      {/* Star/lock icon */}
      <div className="challenge-icon">
        {!status ? '🔒' : isCompleted ? '⭐' : `${questionNum}`}
      </div>

      {/* Label */}
      <div className="challenge-label">
        Challenge {questionNum}
      </div>

      {/* Status */}
      <div className="challenge-status">
        {!status ? 'Locked' : isCompleted ? 'Done!' : 'Play →'}
      </div>

      {/* Glow */}
      <div className="challenge-glow" />
    </div>
  );
}

export default ChallengeCard;