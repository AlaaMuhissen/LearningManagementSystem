import { useParams } from 'react-router-dom';
import TopicCard from '../../Components/Cards/TopicCard';
import { useTopics } from '../../Components/TopicsContext';
import { Box, Typography } from '@mui/material';

const LANG_CONFIG = {
  html:       { emoji: '🌐', color: '#f16529', sub: 'Choose a topic to explore' },
  css:        { emoji: '🎨', color: '#4fc3f7', sub: 'Choose a topic to explore' },
  javascript: { emoji: '⚡', color: '#f7df1e', sub: 'Choose a topic to explore' },
  python:     { emoji: '🐍', color: '#4fc3f7', sub: 'Choose a topic to explore' },
  default:    { emoji: '💻', color: '#64ffda', sub: 'Choose a topic to explore' },
};

function LanguageTopicsPage() {
  const { syllabusId, language } = useParams();
  const topics = useTopics(syllabusId, language);
  const cfg = LANG_CONFIG[language?.toLowerCase()] || LANG_CONFIG.default;

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{
          width: 52, height: 52, borderRadius: '14px', fontSize: 26,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `${cfg.color}22`,
          border: `1px solid ${cfg.color}44`,
          flexShrink: 0,
        }}>
          {cfg.emoji}
        </Box>
        <Box>
          <Typography sx={{
            fontSize: { xs: 20, md: 26 }, fontWeight: 800,
            color: cfg.color, letterSpacing: '-0.3px',
            textTransform: 'uppercase',
          }}>
            {language}
          </Typography>
          <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
            {cfg.sub}
          </Typography>
        </Box>
      </Box>

      {/* Topic cards grid */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
        gap: 2,
      }}>
        {topics?.map((topic, i) => (
          <TopicCard
            key={i}
            title={topic?.topic_name}
            language={language}
            syllabusId={syllabusId}
            index={i}
          />
        ))}
      </Box>
    </Box>
  );
}

export default LanguageTopicsPage;