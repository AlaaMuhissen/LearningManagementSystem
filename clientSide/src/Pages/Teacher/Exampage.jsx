import API_URL from '../../config/api.js';
import  { useState, useEffect, useRef } from 'react';
import { Box, Typography, CircularProgress, LinearProgress, Button, Paper, Chip } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Components/Login/AuthContext';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DragContainer from '../../Components/Game/DragContainer';
import BlocksDiv from '../../Components/Game/BlocksDiv';
import Editor from '@monaco-editor/react';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { usePoints } from '../../Components/PointsContext';
import Phone from '../../Components/Game/Phone';

function ExamPage() {
  const { exam_id } = useParams();
  const navigate = useNavigate();
  const { userData } = useAuth();
  const { points, updatePoints } = usePoints();
  const [exercises, setExercises] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userAnswer, setUserAnswer] = useState([]);
  const [freeCode, setFreeCode] = useState('');
  const [isRun, setIsRun] = useState(false);
  const [preview, setPreview] = useState('');
  const [timeLeft, setTimeLeft] = useState(null);
  const [assignmentId, setAssignmentId] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [resultHtml, setResultHtml] = useState('');
  const [showPhone, setShowPhone] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        // Get exam details for time limit
        const examRes = await fetch(`${API_URL}/api/teacher/studentExams/${userData.id}`);
        const exams = await examRes.json();
        const exam = exams.find(e => e.id === parseInt(exam_id));

        if (exam?.time_limit) {
          setTimeLeft(exam.time_limit * 60);
        }

        // Get assignment id
        const assignRes = await fetch(`${API_URL}/api/teacher/getAssignment/${exam_id}/${userData.id}`);
        const assignData = await assignRes.json();
        setAssignmentId(assignData.id);

        // Get exercises
        const exRes = await fetch(`${API_URL}/api/teacher/examExercises/${exam_id}`);
        const exData = await exRes.json();
        setExercises(Array.isArray(exData) ? exData : []);
        if (exData[0]?.level === 3) setFreeCode('');
      } catch (error) {
        console.error('Error fetching exam:', error);
      } finally {
        setLoading(false);
      }
    };
    if (userData?.id) fetchExam();
  }, [exam_id, userData?.id]);

  // Timer
  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) { handleFinishExam(); return; }
    timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const currentExercise = exercises[currentIndex];
  const isLastExercise = currentIndex === exercises.length - 1;

  const checkAnswer = async (answerValue) => {
    try {
      const res = await fetch(`${API_URL}/api/teacher/exercises/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exercise_id: currentExercise.id, student_answer: answerValue }),
      });
      const data = await res.json();
      return data.is_correct;
    } catch {
      return false;
    }
  };

  const handleCorrectAnswer = async (answerValue, skipCheck = false) => {
    const isCorrect = skipCheck ? false : await checkAnswer(answerValue);
    const newAnswer = {
      exercise_id: currentExercise.id,
      answer: answerValue,
      is_correct: isCorrect,
    };
    const newAnswers = [...answers, newAnswer];
    setAnswers(newAnswers);

    if (isCorrect) {
      updatePoints(points + (currentExercise.reward || 5));
      toast.success('Correct! 🎉');
      // Show phone preview for HTML/CSS
      if (['html', 'css'].includes(currentExercise?.language?.toLowerCase())) {
        const html = userAnswer?.map(b => b.value).join('') || freeCode;
        setResultHtml(html);
        setShowPhone(true);
      }
    } else {
      toast.error('Not quite right');
    }

    // Save answer
    if (assignmentId) {
      await fetch(`${API_URL}/api/teacher/submitAnswer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignment_id: assignmentId, ...newAnswer }),
      });
    }

    setTimeout(() => {
      if (isLastExercise) {
        handleFinishExam(newAnswers);
      } else {
        setCurrentIndex(i => i + 1);
        setUserAnswer([]);
        setFreeCode('');
        setIsRun(false);
        setPreview('');
        setShowPhone(false);
        setResultHtml('');
      }
    }, 1500);
  };

  const handleFinishExam = async (finalAnswers = answers) => {
    clearTimeout(timerRef.current);
    const score = finalAnswers.filter(a => a.is_correct).length;
    if (assignmentId) {
      await fetch(`${API_URL}/api/teacher/completeExam/${assignmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score }),
      });
    }
    navigate(`/examResult/${exam_id}/${score}/${exercises.length}`);
  };

  const handleDragCorrect = () => {
    handleCorrectAnswer(JSON.stringify(userAnswer));
  };

  const handleFreeCodeSubmit = () => {
    handleCorrectAnswer(freeCode);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (exercises.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="#fff">No exercises found for this exam.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, color: '#fff' }}>
      <ToastContainer />

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" fontWeight="bold">
          Exercise {currentIndex + 1} of {exercises.length}
        </Typography>
        {timeLeft !== null && (
          <Chip
            icon={<AccessTimeIcon />}
            label={formatTime(timeLeft)}
            color={timeLeft < 60 ? 'error' : 'primary'}
            sx={{ fontSize: 18, p: 1 }}
          />
        )}
      </Box>

      {/* Progress bar */}
      <LinearProgress
        variant="determinate"
        value={(currentIndex / exercises.length) * 100}
        sx={{ mb: 3, height: 8, borderRadius: 4 }}
      />

      {/* Exercise */}
      <Paper sx={{ p: 3, bgcolor: '#193255', minHeight: 400 }}>
        <Typography variant="h6" sx={{ mb: 3, color: '#a0c4ff' }}>
          {currentExercise?.question_text}
        </Typography>

        <Chip
          label={`${currentExercise?.language?.toUpperCase()} — Level ${currentExercise?.level}`}
          sx={{ mb: 3, bgcolor: '#0d1d32', color: '#5698f0' }}
        />

        {/* Level 1 & 2 — Drag & Drop */}
        {currentExercise?.level <= 2 && (
          <DndProvider backend={HTML5Backend}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" color="#a0c4ff" sx={{ mb: 1 }}>
                  {currentExercise.level === 1 ? 'Drop blocks in order:' : 'Arrange all blocks:'}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {currentExercise.blocks?.map((block, i) => (
                    <DragContainer
                      key={i}
                      boardId={block.id}
                      level={currentExercise.level}
                      availableBlocks={currentExercise.blocks}
                      setUserAnswerCallback={setUserAnswer}
                      userAnswer={userAnswer}
                      isRun={isRun}
                      answerBlockNum={currentExercise.blocks?.length}
                      onCorrectAnswer={handleDragCorrect}
                      counter={() => {}}
                      tempC={0}
                    />
                  ))}
                </Box>
                {currentExercise.level === 2 && (
                  <Button
                    variant="contained"
                    sx={{ mt: 2 }}
                    onClick={() => { setIsRun(true); handleDragCorrect(); }}
                  >
                    Run
                  </Button>
                )}
              </Box>
              <Box sx={{ flex: 1 }}>
                <BlocksDiv availableBlocks={currentExercise.blocks || []} />
              </Box>
            </Box>
          </DndProvider>
        )}

        {/* Level 3 — Free Coding */}
        {currentExercise?.level === 3 && (
          <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', lg: 'row' } }}>
            <Box sx={{ flex: 1 }}>
              <Editor
                height="300px"
                language={currentExercise.language || 'html'}
                theme="vs-dark"
                value={freeCode}
                onChange={val => setFreeCode(val || '')}
                options={{ fontSize: 13, minimap: { enabled: false }, wordWrap: 'on' }}
              />
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button variant="outlined" onClick={() => setPreview(freeCode)}>▶ Run</Button>
                <Button variant="contained" onClick={handleFreeCodeSubmit}>✓ Submit</Button>
              </Box>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="#a0c4ff">Preview</Typography>
              <Box sx={{ bgcolor: '#fff', borderRadius: 1, overflow: 'hidden', minHeight: 300 }}>
                {preview && (
                  <iframe
                    title="preview"
                    srcDoc={preview}
                    style={{ width: '100%', minHeight: 300, border: 'none' }}
                    sandbox="allow-scripts"
                  />
                )}
              </Box>
            </Box>
          </Box>
        )}
      </Paper>

      <Button
        variant="text"
        sx={{ mt: 2, color: '#a0c4ff' }}
        onClick={() => handleCorrectAnswer('skipped', true)}
      >
        Skip this exercise →
      </Button>
      {showPhone && <Phone resultHtml={resultHtml} />}
    </Box>
  );
}

export default ExamPage;