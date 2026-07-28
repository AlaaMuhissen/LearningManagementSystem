import API_URL from '../../config/api.js';
import { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DragContainer from './DragContainer';
import BlocksDiv from './BlocksDiv';
import { useNavigate } from 'react-router-dom';
import useSound from 'use-sound';
import coinsSound from '/sounds/cash-register-fake-88639.mp3';
import ohNoSound from '/sounds/oh-no-113125.mp3';
import wahSound from '/sounds/wah-wah-sad-trombone-6347.mp3';
import { useAuth } from '../Login/AuthContext';
import HintButton from './HintButton';
import { usePoints } from '../PointsContext';
import Phone from './Phone';
import { Box, Typography, Button } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRef } from 'react';

export default function DragAndDropQuiz({
  syllabusId, question, availableBlocks, answer,
  level, qNum, lan, lanId, topic, allQuestionNum,
  reward, hint, onHintUsed, questionId
}) {
  const correctCalledRef = useRef(false);
  const { points, updatePoints } = usePoints();
  const navigate = useNavigate();
  const [userAnswer, setUserAnswer] = useState([]);
  const { userData } = useAuth();
  const userId = userData?.id;
  const [isRun, setIsRun] = useState(false);
  const [counter, setCounter] = useState(0);
  const [resultHtml, setResultHtml] = useState('');
  const [showPhone, setShowPhone] = useState(false);
  const [wrongAnim, setWrongAnim] = useState(false);


  const [play] = useSound(coinsSound);
  const [playOhNo] = useSound(ohNoSound);
  const [playWah] = useSound(wahSound);

  const checkIfAlreadyCompleted = async () => {
    try {
      const res = await fetch(`${API_URL}/api/progress/getLevelStatus/${syllabusId}/${lanId}/${topic}/${level}/${userId}`);
      const data = await res.json();
      return data.isTopicCompleted === true;
    } catch { return false; }
  };

  const saveProgress = async () => {
    try {
      await fetch(`${API_URL}/api/progress/updateProgress`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: userId, syllabus_id: syllabusId,
          language_id: lanId, topic_name: topic,
          level, questionNum: allQuestionNum
        })
      });
    } catch (err) { console.error('Error saving progress:', err); }
  };

  const handleCorrectAnswer = async () => {
    if (correctCalledRef.current) return;
    correctCalledRef.current = true;
    const isCorrect =
      (userAnswer.length === answer.length &&
        userAnswer.every(obj1 => answer.some(obj2 => obj1.id === obj2.id))) ||
      level === 1;

    if (isCorrect) {
      // Capture answer BEFORE clearing state
      const capturedAnswer = [...userAnswer];
      setIsRun(true);
      setCounter(0);
      play();

      // Build live HTML from the captured answer
      // Join with space so CSS tokens like "p {" "color:" "red;" "}" become valid
      const code = capturedAnswer.map(b => b.value).join(' ');
      let liveHtml;
      const lang = lan?.toLowerCase();

      if (lang === 'css') {
        // CSS must go in <head> for browser to apply it
        liveHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    /* Base styles */
    * { box-sizing: border-box; }
    body { font-family: -apple-system, sans-serif; padding: 16px; margin: 0; font-size: 14px; line-height: 1.6; color: #333; }
    a { color: #007aff; }
    button { cursor: pointer; padding: 6px 14px; }
    .card { border: 1px solid #ccc; padding: 12px; border-radius: 6px; margin: 8px 0; }
    .container { display: flex; gap: 8px; margin: 8px 0; }
    .item { border: 1px solid #ccc; padding: 8px; flex: 1; }
    /* ✏️ Student CSS */
    ${code}
  </style>
</head>
<body>
  <h1>Heading 1</h1>
  <h2>Heading 2</h2>
  <p>This is a paragraph of text to show your styles.</p>
  <div class="card">This is a card div</div>
  <div class="container">
    <div class="item">Item 1</div>
    <div class="item">Item 2</div>
  </div>
  <a href="#">This is a link — click me!</a>
  <br><br>
  <button>Click me</button>
  <ul><li>List item 1</li><li>List item 2</li></ul>
</body>
</html>`;
      } else {
        // HTML: wrap in proper document
        liveHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; }
    body { font-family: -apple-system, sans-serif; padding: 16px; margin: 0; font-size: 14px; line-height: 1.6; color: #333; }
    a { color: #007aff; }
    img { max-width: 100%; height: auto; }
    button { cursor: pointer; padding: 6px 14px; }
    table { border-collapse: collapse; width: 100%; }
    td, th { border: 1px solid #ccc; padding: 6px 10px; text-align: left; }
    ul, ol { padding-left: 20px; }
    nav { display: flex; gap: 12px; padding: 8px 0; }
  </style>
</head>
<body>${code}</body>
</html>`;
      }
      setResultHtml(liveHtml);
      setShowPhone(true);
      setUserAnswer([]);

      const alreadyDone = await checkIfAlreadyCompleted();
      if (!alreadyDone) {
        updatePoints(points + reward);
        await saveProgress();
      }
      // No auto-navigate — user closes Phone with X button
    } else {
      playOhNo();
      setWrongAnim(true);
      toast.error('❌ Not quite! Try again', { theme: 'dark' });
      setTimeout(() => setWrongAnim(false), 600);
    }
  };

  const handleRunButton = () => {
    setIsRun(true);
    const wrong = userAnswer.filter(ans => ans.id !== ans.boardId);
    wrong.length === 0 ? handleCorrectAnswer() : playWah();
  };

  // Watch for level 1 auto-complete
  useEffect(() => {
    if (parseInt(level) !== 1 || !answer?.length) return;
    if (userAnswer.length === answer.length) {
      const allCorrect = userAnswer.every(ans => ans.id === ans.boardId);
      if (allCorrect) handleCorrectAnswer();
    }
  }, [userAnswer]);

  return (
    <>
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', lg: 'row' },
        gap: 3,
        minHeight: 360,
        animation: wrongAnim ? 'shake 0.5s ease' : 'none',
        '@keyframes shake': {
          '0%,100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-8px)' },
          '40%': { transform: 'translateX(8px)' },
          '60%': { transform: 'translateX(-6px)' },
          '80%': { transform: 'translateX(6px)' },
        }
      }}>
        <DndProvider backend={HTML5Backend}>
          {/* Left — question + drop zones */}
          <Box sx={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Question */}
            <Box sx={{
              background: 'rgba(100,255,218,0.04)',
              border: '1px solid rgba(100,255,218,0.12)',
              borderRadius: '14px',
              p: 2.5,
            }}>
              <Typography sx={{
                fontSize: { xs: 15, md: 18 },
                fontWeight: 700,
                color: '#fff',
                lineHeight: 1.5,
              }}>
                💬 {question}
              </Typography>
              <HintButton hint={hint} reward={reward} onHintUsed={onHintUsed} questionId={questionId} />
            </Box>

            {/* Drop zones — overlapping so puzzle pieces connect */}
            <Box>
              <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', mb: 1.5, textTransform: 'uppercase', letterSpacing: 1 }}>
                {parseInt(level) === 1 ? '📥 Drop blocks in the correct order' : '🔨 Arrange all blocks then click Run'}
              </Typography>
              <Box className="drop-zones-row" sx={{ display: 'flex', alignItems: 'center', flexWrap: 'nowrap', overflowX: 'auto', pb: 1 }}>
                {answer?.map((drop, i) => (
                  <DragContainer
                    availableBlocks={availableBlocks}
                    key={i}
                    boardId={drop.id}
                    slotIndex={i}
                    totalSlots={answer.length}
                    level={parseInt(level)}
                    setUserAnswerCallback={setUserAnswer}
                    userAnswer={userAnswer}
                    isRun={isRun}
                    answerBlockNum={answer.length}
                    onCorrectAnswer={handleCorrectAnswer}
                    counter={setCounter}
                    tempC={counter}
                  />
                ))}
              </Box>
            </Box>

            {/* Run button for level 2 */}
            {parseInt(level) === 2 && (
              <Box>
                <Button
                  onClick={handleRunButton}
                  variant="contained"
                  sx={{
                    background: 'linear-gradient(135deg, #64ffda, #4fc3f7)',
                    color: '#0b0920',
                    fontWeight: 800,
                    fontSize: 14,
                    borderRadius: '12px',
                    px: 4, py: 1.2,
                    textTransform: 'none',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #4fc3f7, #64ffda)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 24px rgba(100,255,218,0.3)',
                    },
                    transition: 'all 0.2s',
                  }}
                >
                  ▶ Run Code
                </Button>
              </Box>
            )}
          </Box>

          {/* Right — draggable blocks */}
          <Box sx={{
            flex: 1,
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '14px',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}>
            <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>
              🧩 Code Blocks — drag to answer
            </Typography>
            <BlocksDiv availableBlocks={availableBlocks} />
          </Box>
        </DndProvider>
      </Box>

      {showPhone && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
          <Phone
            resultHtml={resultHtml}
            onClose={() => {
              setShowPhone(false);
              correctCalledRef.current = false;
              if (qNum >= allQuestionNum) {
                navigate(`/dashboard/${syllabusId}/${lan}/${topic}/levels/${parseInt(level) + 1}/challenges/1`);
                window.location.reload();
              } else {
                navigate(`/dashboard/${syllabusId}/${lan}/${topic}/levels/${level}/challenges/${qNum + 1}`);
                window.location.reload();
              }
            }}
          />
        </div>
      )}
      <ToastContainer position="top-center" autoClose={2000} />
    </>
  );
}