import API_URL from '../../config/api.js';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Login/AuthContext';
import '../../styles/topicCard.css';

const TOPIC_ICONS = {
  'headings': '📝', 'heading': '📝',
  'paragraphs': '📄', 'paragraph': '📄',
  'lists': '📋', 'list': '📋',
  'links': '🔗', 'link': '🔗',
  'images': '🖼️', 'image': '🖼️',
  'tables': '📊', 'table': '📊',
  'forms': '📮', 'form': '📮',
  'colors': '🎨', 'color': '🎨',
  'flexbox': '🧩', 'grid': '🔲',
  'animation': '✨', 'variables': '📦',
  'functions': '⚙️', 'function': '⚙️',
  'loops': '🔄', 'loop': '🔄',
  'arrays': '📦', 'array': '📦',
  'objects': '🗂️', 'object': '🗂️',
  'default': '💡',
};

const getTopicIcon = (title) => {
  const t = title?.toLowerCase();
  for (const key of Object.keys(TOPIC_ICONS)) {
    if (t?.includes(key)) return TOPIC_ICONS[key];
  }
  return TOPIC_ICONS.default;
};

function TopicCard({ title, language, syllabusId, index }) {
  const navigate = useNavigate();
  const [completed, setCompleted] = useState(false);
  const [, setLanguageId] = useState(0);
  const { userData } = useAuth();
  const studentId = userData?.id;
  const displayTitle = title?.split('_').join(' ');
  const icon = getTopicIcon(title);

  const handleClick = () => {
    navigate(`/dashboard/${syllabusId}/${language}/${title}/levels`);
  };

  useEffect(() => {
    if (!studentId) return;
    fetch(`${API_URL}/api/syllabus/getLanguageId/${syllabusId}/${language}`)
      .then(res => res.json())
      .then(data => {
        const langId = data[0]?.language_id;
        setLanguageId(langId);
        return fetch(`${API_URL}/api/progress/getTopicStatus/${syllabusId}/${langId}/${title}/${studentId}`);
      })
      .then(res => res.json())
      .then(data => setCompleted(data?.isTopicCompleted === true))
      .catch(err => console.error('TopicCard error:', err));
  }, [studentId]);

  return (
    <div
      className={`topic-card ${completed ? 'topic-done' : ''}`}
      style={{ animationDelay: `${index * 0.08}s` }}
      onClick={handleClick}
    >
      {/* Completion crown */}
      {completed && (
        <div className="topic-crown">👑</div>
      )}

      {/* Icon */}
      <div className="topic-icon">{icon}</div>

      {/* Title */}
      <div className="topic-title">{displayTitle}</div>

      {/* Status pill */}
      <div className={`topic-status ${completed ? 'status-done' : 'status-new'}`}>
        {completed ? '✅ Completed' : '▶ Start'}
      </div>

      {/* Hover arrow */}
      <div className="topic-arrow">→</div>

      {/* Glow */}
      <div className="topic-glow" />
    </div>
  );
}

export default TopicCard;