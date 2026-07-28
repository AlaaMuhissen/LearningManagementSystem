import API_URL from '../../config/api.js';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ChallengeCard from '../../Components/Cards/ChallengeCard.jsx';
import { Box, Typography } from '@mui/material';

const LEVEL_LABELS = {
  '1': { label: 'Guided', emoji: '🧩', color: '#64ffda' },
  '2': { label: 'Build',  emoji: '🔨', color: '#4fc3f7' },
  '3': { label: 'Free Code', emoji: '✍️', color: '#a78bfa' },
  '4': { label: 'Challenge', emoji: '🏆', color: '#ffd700' },
};

function ChallengePage() {
  const [questions, setQuestions] = useState(null);
  const { topic, syllabusId, language, levelNum } = useParams();
  const levelCfg = LEVEL_LABELS[levelNum] || LEVEL_LABELS['1'];
  const displayTopic = topic?.split('_').join(' ');

  useEffect(() => {
    fetch(`${API_URL}/api/QA/getAllQuestionAndAnswer/${syllabusId}/${language}/${topic}`)
      .then(res => res.json())
      .then(data => setQuestions(data))
      .catch(error => console.error('Error during fetching topics:', error));
  }, [syllabusId, language, topic]);

  const levelQuestions = questions && questions[levelNum];


  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', mb: 0.5, textTransform: 'uppercase', letterSpacing: 1 }}>
          {language} › {displayTopic} › Level {levelNum}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <span style={{ fontSize: 28 }}>{levelCfg.emoji}</span>
          <Typography sx={{
            fontSize: { xs: 22, md: 26 }, fontWeight: 800,
            color: levelCfg.color,
          }}>
            {levelCfg.label} Challenges
          </Typography>
        </Box>
        <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
          Complete each challenge to progress to the next one
        </Typography>
      </Box>

      {/* Challenge cards */}
      {!levelQuestions || levelQuestions.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, color: 'rgba(255,255,255,0.2)', fontSize: 16 }}>
          No challenges yet
        </Box>
      ) : (
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)', lg: 'repeat(5, 1fr)' },
          gap: 2,
        }}>
          {levelQuestions.map((question, index) => (
            <ChallengeCard
              key={index}
              questionNum={index + 1}
              levelColor={levelCfg.color}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}

export default ChallengePage;