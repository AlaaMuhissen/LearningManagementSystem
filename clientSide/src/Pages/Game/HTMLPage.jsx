import API_URL from '../../config/api.js';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import DragAndDropQuiz from '../../Components/Game/DragAndDropQuiz.jsx';
import CodeLevel from '../../Components/Game/CodeLevel.jsx';
import { Box, Typography, LinearProgress } from '@mui/material';
import { useActiveExercise } from '../../Components/ActiveExerciseContext';

const LEVEL_CFG = {
  '1': { label: 'Guided',    emoji: '🧩', color: '#64ffda' },
  '2': { label: 'Build',     emoji: '🔨', color: '#4fc3f7' },
  '3': { label: 'Free Code', emoji: '✍️',  color: '#a78bfa' },
  '4': { label: 'Challenge', emoji: '🏆', color: '#ffd700' },
};

function HTMLPage() {
  const [questions, setQuestions] = useState([]);
  const [languageId, setLanguageId] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);
  const { challengeNum, levelNum, topic, language, syllabusId } = useParams();
  const cfg = LEVEL_CFG[levelNum] || LEVEL_CFG['1'];
  const displayTopic = topic?.split('_').join(' ');
  const { setActiveExercise, clearActiveExercise } = useActiveExercise();

  useEffect(() => {
    fetch(`${API_URL}/api/syllabus/getLanguageId/${syllabusId}/${language}`)
      .then(res => res.json())
      .then(data => setLanguageId(data[0].language_id))
      .catch(error => console.error('Error fetching language id:', error));

    fetch(`${API_URL}/api/QA/getAllQuestionAndAnswer/${syllabusId}/${language}/${topic}`)
      .then(res => res.json())
      .then(data => setQuestions(data))
      .catch(error => console.error('Error fetching questions:', error));
  }, [syllabusId, language, topic]);

  React.useEffect(() => { setHintUsed(false); }, [challengeNum]);

  const levelQuestions = questions[levelNum];
  const currentQuestion = levelQuestions?.[challengeNum - 1];
  const isFreeCoding = parseInt(levelNum) >= 3;
  const totalQ = levelQuestions?.length || 0;
  const progress = totalQ > 0 ? (parseInt(challengeNum) / totalQ) * 100 : 0;
  const reward = hintUsed
    ? Math.floor((currentQuestion?.reward || 5) * 0.7)
    : (currentQuestion?.reward || 5);

  // Report the current question to the globally-mounted robot button.
  // NOTE: this only covers the question itself (text/hint/level/language) —
  // it does NOT include the student's live attempt (blocks arranged, code
  // written, correct/incorrect), because that state lives inside
  // DragAndDropQuiz.jsx / CodeLevel.jsx, not here. For the same
  // "why is my answer wrong" richness StudentPractice.jsx has, those two
  // components would need to report into this context themselves.
  useEffect(() => {
    if (!currentQuestion) return;
    setActiveExercise({
      language,
      level: parseInt(levelNum),
      question_text: currentQuestion.question_text,
      hint: currentQuestion.hint,
      exercise_type: isFreeCoding ? 'free code editor' : 'drag-and-drop blocks',
    });
    return () => clearActiveExercise();
  }, [currentQuestion, language, levelNum, isFreeCoding]);

  return (
    <Box sx={{ p: { xs: 1.5, md: 2 } }}>
      {/* Top bar */}
      <Box sx={{ mb: 2 }}>
        {/* Breadcrumb */}
        <Typography sx={{
          fontSize: 11, color: 'rgba(255,255,255,0.25)',
          textTransform: 'uppercase', letterSpacing: 1, mb: 1,
        }}>
          {language} › {displayTopic} › Level {levelNum}
        </Typography>

        {/* Progress bar */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Box sx={{ flex: 1 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 8, borderRadius: 99,
                bgcolor: 'rgba(255,255,255,0.06)',
                '& .MuiLinearProgress-bar': {
                  background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color}aa)`,
                  borderRadius: 99,
                  boxShadow: `0 0 8px ${cfg.color}66`,
                }
              }}
            />
          </Box>
          <Box sx={{
            fontSize: 12, fontWeight: 700, color: cfg.color,
            minWidth: 48, textAlign: 'right',
          }}>
            {challengeNum}/{totalQ}
          </Box>
        </Box>

        {/* Level badge + reward */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <span style={{ fontSize: 16 }}>{cfg.emoji}</span>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: cfg.color }}>
              {cfg.label} — Challenge {challengeNum}
            </Typography>
          </Box>
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 0.5,
            background: 'rgba(255,215,0,0.08)',
            border: '1px solid rgba(255,215,0,0.2)',
            borderRadius: '99px', px: 1.5, py: 0.4,
          }}>
            <span style={{ fontSize: 12 }}>⚡</span>
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#ffd700' }}>
              {reward} XP
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Game content */}
      <Box sx={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '20px',
        p: { xs: 2, md: 3 },
        minHeight: 400,
      }}>
        {levelQuestions && currentQuestion ? (
          isFreeCoding ? (
            <CodeLevel
              syllabusId={parseInt(syllabusId)}
              question={currentQuestion?.question_text}
              level={parseInt(levelNum)}
              qNum={parseInt(challengeNum)}
              lan={language}
              lanId={parseInt(languageId)}
              topic={topic}
              allQuestionNum={totalQ}
              reward={reward}
              hint={currentQuestion?.hint}
              questionId={currentQuestion?.question_id}
              onHintUsed={() => setHintUsed(true)}
            />
          ) : (
            <DragAndDropQuiz
              syllabusId={parseInt(syllabusId)}
              question={currentQuestion?.question_text}
              availableBlocks={currentQuestion?.answer_values}
              answer={currentQuestion?.answer_values}
              level={parseInt(levelNum)}
              qNum={parseInt(challengeNum)}
              lan={language}
              lanId={parseInt(languageId)}
              topic={topic}
              allQuestionNum={totalQ}
              reward={reward}
              hint={currentQuestion?.hint}
              questionId={currentQuestion?.question_id}
              onHintUsed={() => setHintUsed(true)}
            />
          )
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
            <Typography sx={{ color: 'rgba(255,255,255,0.2)' }}>Loading challenge...</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default HTMLPage;