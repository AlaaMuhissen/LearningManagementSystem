import { useParams } from 'react-router-dom';
import { useTopics } from '../../Components/TopicsContext';
import LevelCard from '../../Components/Cards/LevelCard';
import { Box, Typography } from '@mui/material';

const LEVEL_CONFIG = {
  1: { label: 'Guided',      emoji: '🧩', desc: 'Drag & drop blocks',  color: '#64ffda' },
  2: { label: 'Build',       emoji: '🔨', desc: 'Build before run',    color: '#4fc3f7' },
  3: { label: 'Free Code',   emoji: '✍️',  desc: 'Write it yourself',   color: '#a78bfa' },
  4: { label: 'Challenge',   emoji: '🏆', desc: 'Ultimate challenge',  color: '#ffd700' },
};

function LevelsPage() {
  const { language, topic, syllabusId } = useParams();
  const topics = useTopics(syllabusId, language);
  const levels = topics?.filter(top => top.topic_name === topic);
  const numLevels = levels?.length > 0 ? parseInt(levels[0].levelNum) : 0;
  const displayTopic = topic?.split('_').join(' ');

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', mb: 0.5, textTransform: 'uppercase', letterSpacing: 1 }}>
          {language?.toUpperCase()} › {displayTopic}
        </Typography>
        <Typography sx={{
          fontSize: { xs: 22, md: 28 }, fontWeight: 800,
          background: 'linear-gradient(90deg, #64ffda, #a78bfa)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          mb: 0.5,
        }}>
          Pick Your Level 🎮
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
          Complete each level to unlock the next one
        </Typography>
      </Box>

      {/* Level path */}
      {numLevels > 0 ? (
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
          gap: 2,
        }}>
          {[...Array(numLevels)].map((_, i) => (
            <LevelCard
              key={i}
              syllabusId={syllabusId}
              language={language}
              topic={topic}
              levelNumber={i + 1}
              levelConfig={LEVEL_CONFIG[i + 1] || LEVEL_CONFIG[1]}
            />
          ))}
        </Box>
      ) : (
        <Box sx={{
          textAlign: 'center', py: 8,
          color: 'rgba(255,255,255,0.2)', fontSize: 16,
        }}>
          No levels yet
        </Box>
      )}
    </Box>
  );
}

export default LevelsPage;