import API_URL from '../../config/api.js';
import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Chip, Tab, Tabs,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, CircularProgress, Dialog, DialogTitle, DialogContent,
  DialogActions, Tooltip, Avatar
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import PeopleIcon from '@mui/icons-material/People';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import QuizIcon from '@mui/icons-material/Quiz';
import BarChartIcon from '@mui/icons-material/BarChart';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { getAuth } from 'firebase/auth';
import { useAuth } from '../../Components/Login/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TeacherExerciseForm from './TeacherExerciseForm';
import TeacherExamForm from './TeacherExamForm';
import EditExerciseForm from './EditExerciseForm';
import EditExamForm from './EditExamForm';

const LEVEL_LABELS = { 1: 'Guided', 2: 'Build', 3: 'Free Code' };
const LEVEL_COLORS_MAP = { 1: '#64ffda', 2: '#4fc3f7', 3: '#a78bfa' };

// Shared dark card style
const darkCard = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '16px',
  overflow: 'hidden',
};

// Table cell style
const tc = { color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.06)', fontSize: 13 };
const th = { color: 'rgba(255,255,255,0.35)', borderColor: 'rgba(255,255,255,0.06)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 };

function StatCard({ value, label, color, emoji }) {
  return (
    <Box sx={{
      ...darkCard,
      p: 2.5, textAlign: 'center', minWidth: 90,
      transition: 'all 0.2s',
      '&:hover': { border: `1px solid ${color}44`, background: `${color}08` }
    }}>
      <Box sx={{ fontSize: 22, mb: 0.5 }}>{emoji}</Box>
      <Typography sx={{ fontSize: 28, fontWeight: 900, color, lineHeight: 1 }}>{value}</Typography>
      <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', mt: 0.3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8 }}>{label}</Typography>
    </Box>
  );
}

function EmptyState({ emoji, text }) {
  return (
    <Box sx={{ py: 6, textAlign: 'center' }}>
      <Box sx={{ fontSize: 40, mb: 1, opacity: 0.4 }}>{emoji}</Box>
      <Typography sx={{ color: 'rgba(255,255,255,0.2)', fontSize: 14 }}>{text}</Typography>
    </Box>
  );
}

function StudentChip({ student, selected, onToggle }) {
  return (
    <Box
      onClick={() => onToggle(student.id)}
      sx={{
        display: 'flex', alignItems: 'center', gap: 1,
        px: 1.5, py: 0.8, borderRadius: '10px', cursor: 'pointer',
        border: `1px solid ${selected ? 'rgba(100,255,218,0.4)' : 'rgba(255,255,255,0.08)'}`,
        background: selected ? 'rgba(100,255,218,0.08)' : 'transparent',
        transition: 'all 0.2s',
        '&:hover': { border: '1px solid rgba(100,255,218,0.25)', background: 'rgba(100,255,218,0.05)' }
      }}
    >
      <Avatar sx={{ width: 24, height: 24, fontSize: 10, background: selected ? '#64ffda' : 'rgba(255,255,255,0.1)', color: selected ? '#0b0920' : '#fff', fontWeight: 700 }}>
        {student.username?.charAt(0)?.toUpperCase()}
      </Avatar>
      <Typography sx={{ fontSize: 13, color: selected ? '#64ffda' : 'rgba(255,255,255,0.6)', fontWeight: selected ? 600 : 400 }}>
        {student.username}
      </Typography>
    </Box>
  );
}

const TAB_CONFIG = [
  { label: 'Students',    icon: <PeopleIcon sx={{ fontSize: 16 }} /> },
  { label: 'Exercises',   icon: <FitnessCenterIcon sx={{ fontSize: 16 }} /> },
  { label: 'Exams',       icon: <QuizIcon sx={{ fontSize: 16 }} /> },
  { label: 'Submissions', icon: <AssessmentIcon sx={{ fontSize: 16 }} /> },
  { label: 'Analytics',   icon: <BarChartIcon sx={{ fontSize: 16 }} /> },
];

function TeacherDashboard({ activeTab }) {
  const [tab, setTab] = useState(0);

  // Sync with sidebar selection
  useEffect(() => {
    if (activeTab !== undefined) setTab(activeTab);
  }, [activeTab]);
  const [joinCode, setJoinCode] = useState('');
  const [students, setStudents] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [showExamForm, setShowExamForm] = useState(false);
  const [publishDialog, setPublishDialog] = useState(null);
  const [editExercise, setEditExercise] = useState(null);
  const [publishExercise, setPublishExercise] = useState(null);
  const [editExam, setEditExam] = useState(null);
  const [selectedStudentsForEx, setSelectedStudentsForEx] = useState([]);
  const [exerciseSubmissions, setExerciseSubmissions] = useState([]);
  const [examSubmissions, setExamSubmissions] = useState([]);
  const [hintUsage, setHintUsage] = useState([]);
  const [retryStats, setRetryStats] = useState({ exerciseRetries: [], examRetries: [] });
  const [selectedStudents, setSelectedStudents] = useState([]);
  const auth = getAuth();
  const { userData, authToken, updateUser } = useAuth();

  const refreshIdToken = async () => {
    const user = auth.currentUser;
    if (user) {
      const freshToken = await user.getIdToken(true);
      updateUser({ ...authToken, token: freshToken });
      return freshToken;
    }
  };

  const fetchAll = async () => {
    if (!userData?.id) return;
    setLoading(true);
    try {
      const token = await refreshIdToken();
      const h = { Authorization: `Bearer ${token}` };
      const [codeRes, stRes, exRes, examRes, exSubRes, examSubRes, hintRes, retryRes] = await Promise.all([
        fetch(`${API_URL}/api/teacher/joinCode/${userData.id}`, { headers: h }),
        fetch(`${API_URL}/api/teacher/students/${userData.id}`, { headers: h }),
        fetch(`${API_URL}/api/teacher/exercises/${userData.id}`, { headers: h }),
        fetch(`${API_URL}/api/teacher/exams/${userData.id}`, { headers: h }),
        fetch(`${API_URL}/api/teacher/exerciseSubmissions/${userData.id}`, { headers: h }),
        fetch(`${API_URL}/api/teacher/examSubmissions/${userData.id}`, { headers: h }),
        fetch(`${API_URL}/api/teacher/hintUsage/${userData.id}`, { headers: h }),
        fetch(`${API_URL}/api/teacher/retryStats/${userData.id}`, { headers: h }),
      ]);
      const [cD, sD, eD, exD, esD, easD, hD, rD] = await Promise.all([
        codeRes.json(), stRes.json(), exRes.json(), examRes.json(),
        exSubRes.json(), examSubRes.json(), hintRes.json(), retryRes.json(),
      ]);
      setJoinCode(cD.code || '');
      setStudents(Array.isArray(sD) ? sD : []);
      setExercises(Array.isArray(eD) ? eD : []);
      setExams(Array.isArray(exD) ? exD : []);
      setExerciseSubmissions(Array.isArray(esD) ? esD : []);
      setExamSubmissions(Array.isArray(easD) ? easD : []);
      setHintUsage(Array.isArray(hD) ? hD : []);
      setRetryStats(rD || { exerciseRetries: [], examRetries: [] });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [userData?.id]);

  const copyCode = () => { navigator.clipboard.writeText(joinCode); toast.success('Copied!'); };
  const toggleStudent = (id, list, setter) => setter(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const publishExerciseNow = async () => {
    if (!selectedStudentsForEx.length) return toast.error('Select at least one student');
    const token = await refreshIdToken();
    await fetch(`${API_URL}/api/teacher/exercises/${publishExercise.id}/publish`, {
      method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_ids: selectedStudentsForEx }),
    });
    toast.success('Exercise published!'); setPublishExercise(null); setSelectedStudentsForEx([]);
  };

  const deleteExercise = async (id) => {
    const token = await refreshIdToken();
    await fetch(`${API_URL}/api/teacher/exercises/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    toast.success('Deleted'); fetchAll();
  };

  const deleteExam = async (id) => {
    const token = await refreshIdToken();
    await fetch(`${API_URL}/api/teacher/exams/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    toast.success('Deleted'); fetchAll();
  };

  const publishExam = async () => {
    if (!selectedStudents.length) return toast.error('Select at least one student');
    const token = await refreshIdToken();
    await fetch(`${API_URL}/api/teacher/exams/${publishDialog.id}/publish`, {
      method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_ids: selectedStudents }),
    });
    toast.success('Published!'); setPublishDialog(null); setSelectedStudents([]); fetchAll();
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ fontSize: 36 }}>👨‍🏫</Box>
      <CircularProgress sx={{ color: '#64ffda' }} size={28} />
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 1.5, md: 2 }, color: '#fff' }}>
      <ToastContainer theme="dark" position="top-center" autoClose={2000} />

      {/* ---- HEADER ---- */}
      <Box sx={{
        ...darkCard,
        p: 3, mb: 3,
        background: 'linear-gradient(135deg, rgba(100,255,218,0.06), rgba(79,195,247,0.03))',
        border: '1px solid rgba(100,255,218,0.12)',
      }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, alignItems: 'flex-start' }}>
          {/* Left — greeting + code */}
          <Box sx={{ flex: 1, minWidth: 220 }}>
            <Typography sx={{ fontSize: 22, fontWeight: 800, color: '#fff', mb: 0.3 }}>
              Teacher Dashboard 👨‍🏫
            </Typography>
            <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', mb: 2 }}>
              Welcome back, <span style={{ color: '#64ffda', fontWeight: 600 }}>{userData?.username}</span>
            </Typography>

            {/* Join code */}
            <Box sx={{
              display: 'inline-flex', alignItems: 'center', gap: 1.5,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(100,255,218,0.15)',
              borderRadius: '12px', px: 2, py: 1.2,
            }}>
              <Box>
                <Typography sx={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1.5, mb: 0.3 }}>
                  Class Join Code
                </Typography>
                <Typography sx={{ fontSize: 24, fontWeight: 900, color: '#64ffda', letterSpacing: 6, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                  {joinCode || '------'}
                </Typography>
              </Box>
              <Tooltip title="Copy code">
                <IconButton onClick={copyCode} size="small"
                  sx={{ color: '#64ffda', border: '1px solid rgba(100,255,218,0.2)', borderRadius: '8px', '&:hover': { background: 'rgba(100,255,218,0.1)' } }}>
                  <ContentCopyIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Box>
            <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', mt: 0.8 }}>
              Share this with students to join your class
            </Typography>
          </Box>

          {/* Right — stats */}
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <StatCard value={students.length}  label="Students"  color="#64ffda" emoji="👥" />
            <StatCard value={exercises.length} label="Exercises" color="#4fc3f7" emoji="🏋️" />
            <StatCard value={exams.length}     label="Exams"     color="#a78bfa" emoji="📝" />
          </Box>
        </Box>
      </Box>

      {/* ---- TABS ---- */}
      <Box sx={{ ...darkCard, mb: 2, p: 0.5 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              color: 'rgba(255,255,255,0.35)', fontSize: 12, fontWeight: 600,
              textTransform: 'none', minHeight: 44, gap: 0.5,
              '&.Mui-selected': { color: '#64ffda' },
            },
            '& .MuiTabs-indicator': { background: 'linear-gradient(90deg, #64ffda, #4fc3f7)', borderRadius: 99 },
          }}
        >
          {TAB_CONFIG.map((t, i) => (
            <Tab key={i} label={t.label} icon={t.icon} iconPosition="start" />
          ))}
        </Tabs>
      </Box>

      {/* ---- STUDENTS TAB ---- */}
      {tab === 0 && (
        <Box sx={darkCard}>
          <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <Typography sx={{ fontSize: 15, fontWeight: 700 }}>Your Students</Typography>
            <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', mt: 0.3 }}>
              Students who joined using your class code
            </Typography>
          </Box>
          {students.length === 0 ? <EmptyState emoji="👥" text={`No students yet — share code ${joinCode} with them`} /> : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    {['Student','Email','Phone','Joined'].map(h => <TableCell key={h} sx={th}>{h}</TableCell>)}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students.map(st => (
                    <TableRow key={st.id} sx={{ '&:hover': { background: 'rgba(255,255,255,0.02)' } }}>
                      <TableCell sx={tc}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 30, height: 30, fontSize: 12, background: 'rgba(100,255,218,0.15)', color: '#64ffda', fontWeight: 700 }}>
                            {st.username?.charAt(0)?.toUpperCase()}
                          </Avatar>
                          <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{st.username}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={tc}>{st.email}</TableCell>
                      <TableCell sx={tc}>{st.phone || '—'}</TableCell>
                      <TableCell sx={tc}>{new Date(st.joined_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {/* ---- EXERCISES TAB ---- */}
      {tab === 1 && (
        <Box sx={darkCard}>
          <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography sx={{ fontSize: 15, fontWeight: 700 }}>Your Exercises</Typography>
              <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', mt: 0.3 }}>Create and manage practice exercises</Typography>
            </Box>
            <Button startIcon={<AddIcon />} variant="contained" onClick={() => setShowExerciseForm(true)}
              sx={{ background: 'linear-gradient(135deg, #64ffda, #4fc3f7)', color: '#0b0920', fontWeight: 700, borderRadius: '10px', textTransform: 'none' }}>
              New Exercise
            </Button>
          </Box>
          {exercises.length === 0 ? <EmptyState emoji="🏋️" text="No exercises yet — create your first one!" /> : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    {['Question','Language','Level','Blocks','XP','Deadline','Actions'].map(h => <TableCell key={h} sx={th}>{h}</TableCell>)}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {exercises.map(ex => (
                    <TableRow key={ex.id} sx={{ '&:hover': { background: 'rgba(255,255,255,0.02)' } }}>
                      <TableCell sx={{ ...tc, maxWidth: 260 }}>
                        <Typography noWrap sx={{ fontSize: 13, color: '#fff' }}>{ex.question_text}</Typography>
                      </TableCell>
                      <TableCell sx={tc}>
                        <Chip label={ex.language?.toUpperCase()} size="small"
                          sx={{ bgcolor: 'rgba(100,255,218,0.1)', color: '#64ffda', border: '1px solid rgba(100,255,218,0.2)', fontSize: 11, fontWeight: 700 }} />
                      </TableCell>
                      <TableCell sx={tc}>
                        <Chip label={LEVEL_LABELS[ex.level]} size="small"
                          sx={{ bgcolor: `${LEVEL_COLORS_MAP[ex.level]}18`, color: LEVEL_COLORS_MAP[ex.level], border: `1px solid ${LEVEL_COLORS_MAP[ex.level]}44`, fontSize: 11, fontWeight: 700 }} />
                      </TableCell>
                      <TableCell sx={tc}>{ex.blocks?.length || 0}</TableCell>
                      <TableCell sx={tc}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <span style={{ fontSize: 12 }}>⚡</span>
                          <span style={{ color: '#ffd700', fontWeight: 700 }}>{ex.reward}</span>
                        </Box>
                      </TableCell>
                      <TableCell sx={tc}>
                        {ex.deadline
                          ? <Chip label={new Date(ex.deadline).toLocaleDateString()} size="small" sx={{ bgcolor: 'rgba(255,152,0,0.1)', color: '#ff9800', fontSize: 11 }} />
                          : <Typography sx={{ color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>—</Typography>}
                      </TableCell>
                      <TableCell sx={tc}>
                        <Tooltip title="Publish to students">
                          <IconButton size="small" onClick={() => { setPublishExercise(ex); setSelectedStudentsForEx([]); }}
                            sx={{ color: '#64ffda', '&:hover': { background: 'rgba(100,255,218,0.1)' } }}>
                            <AssignmentIcon sx={{ fontSize: 17 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => setEditExercise(ex)}
                            sx={{ color: '#4fc3f7', '&:hover': { background: 'rgba(79,195,247,0.1)' } }}>
                            <EditIcon sx={{ fontSize: 17 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => deleteExercise(ex.id)}
                            sx={{ color: '#f87171', '&:hover': { background: 'rgba(248,113,113,0.1)' } }}>
                            <DeleteIcon sx={{ fontSize: 17 }} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {/* ---- EXAMS TAB ---- */}
      {tab === 2 && (
        <Box sx={darkCard}>
          <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography sx={{ fontSize: 15, fontWeight: 700 }}>Your Exams</Typography>
              <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', mt: 0.3 }}>Create exams and assign them to students</Typography>
            </Box>
            <Button startIcon={<AddIcon />} variant="contained" onClick={() => setShowExamForm(true)}
              sx={{ background: 'linear-gradient(135deg, #a78bfa, #4fc3f7)', color: '#0b0920', fontWeight: 700, borderRadius: '10px', textTransform: 'none' }}>
              New Exam
            </Button>
          </Box>
          {exams.length === 0 ? <EmptyState emoji="📝" text="No exams yet — create your first one!" /> : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    {['Title','Exercises','Time Limit','Deadline','Retry','Status','Actions'].map(h => <TableCell key={h} sx={th}>{h}</TableCell>)}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {exams.map(exam => (
                    <TableRow key={exam.id} sx={{ '&:hover': { background: 'rgba(255,255,255,0.02)' } }}>
                      <TableCell sx={{ ...tc, fontWeight: 600, color: '#fff' }}>{exam.title}</TableCell>
                      <TableCell sx={tc}>{exam.exercises?.length || 0}</TableCell>
                      <TableCell sx={tc}>{exam.time_limit ? `${exam.time_limit} min` : '∞'}</TableCell>
                      <TableCell sx={tc}>
                        {exam.deadline
                          ? <Chip label={new Date(exam.deadline).toLocaleDateString()} size="small" sx={{ bgcolor: 'rgba(255,152,0,0.1)', color: '#ff9800', fontSize: 11 }} />
                          : <Typography sx={{ color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>—</Typography>}
                      </TableCell>
                      <TableCell sx={tc}>
                        <Chip
                          label={exam.allow_retry ? '✓ Yes' : '✗ No'}
                          size="small"
                          sx={{ bgcolor: exam.allow_retry ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)', color: exam.allow_retry ? '#4ade80' : '#f87171', fontSize: 11 }}
                        />
                      </TableCell>
                      <TableCell sx={tc}>
                        <Chip
                          label={exam.published ? 'Published' : 'Draft'}
                          size="small"
                          sx={{ bgcolor: exam.published ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.06)', color: exam.published ? '#4ade80' : 'rgba(255,255,255,0.35)', fontSize: 11 }}
                        />
                      </TableCell>
                      <TableCell sx={tc}>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => setEditExam(exam)}
                            sx={{ color: '#4fc3f7', '&:hover': { background: 'rgba(79,195,247,0.1)' } }}>
                            <EditIcon sx={{ fontSize: 17 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Publish to students">
                          <IconButton size="small" onClick={() => { setPublishDialog(exam); setSelectedStudents([]); }}
                            sx={{ color: '#64ffda', '&:hover': { background: 'rgba(100,255,218,0.1)' } }}>
                            <SendIcon sx={{ fontSize: 17 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => deleteExam(exam.id)}
                            sx={{ color: '#f87171', '&:hover': { background: 'rgba(248,113,113,0.1)' } }}>
                            <DeleteIcon sx={{ fontSize: 17 }} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {/* ---- SUBMISSIONS TAB ---- */}
      {tab === 3 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Exercise submissions */}
          <Box sx={darkCard}>
            <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <Typography sx={{ fontSize: 15, fontWeight: 700 }}>🏋️ Exercise Submissions</Typography>
            </Box>
            {exerciseSubmissions.length === 0 ? <EmptyState emoji="📭" text="No exercise submissions yet" /> : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>{['Student','Exercise','Language','Level','Status','Assigned'].map(h => <TableCell key={h} sx={th}>{h}</TableCell>)}</TableRow>
                  </TableHead>
                  <TableBody>
                    {exerciseSubmissions.map(sub => (
                      <TableRow key={sub.assignment_id} sx={{ '&:hover': { background: 'rgba(255,255,255,0.02)' } }}>
                        <TableCell sx={tc}>
                          <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{sub.student_name}</Typography>
                          <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{sub.student_email}</Typography>
                        </TableCell>
                        <TableCell sx={{ ...tc, maxWidth: 220 }}><Typography noWrap>{sub.question_text}</Typography></TableCell>
                        <TableCell sx={tc}><Chip label={sub.language?.toUpperCase()} size="small" sx={{ bgcolor: 'rgba(100,255,218,0.08)', color: '#64ffda', fontSize: 11 }} /></TableCell>
                        <TableCell sx={tc}><Chip label={`L${sub.level}`} size="small" sx={{ bgcolor: `${LEVEL_COLORS_MAP[sub.level]}18`, color: LEVEL_COLORS_MAP[sub.level], fontSize: 11 }} /></TableCell>
                        <TableCell sx={tc}>
                          <Chip label={sub.completed ? '✅ Done' : '⏳ Pending'} size="small"
                            sx={{ bgcolor: sub.completed ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.05)', color: sub.completed ? '#4ade80' : 'rgba(255,255,255,0.35)', fontSize: 11 }} />
                        </TableCell>
                        <TableCell sx={tc}>{new Date(sub.assigned_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>

          {/* Exam submissions */}
          <Box sx={darkCard}>
            <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <Typography sx={{ fontSize: 15, fontWeight: 700 }}>📝 Exam Submissions</Typography>
            </Box>
            {examSubmissions.length === 0 ? <EmptyState emoji="📭" text="No exam submissions yet" /> : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>{['Student','Exam','Score','Grade','Completed'].map(h => <TableCell key={h} sx={th}>{h}</TableCell>)}</TableRow>
                  </TableHead>
                  <TableBody>
                    {examSubmissions.map(sub => {
                      const pct = sub.completed_at ? Math.round((sub.score / sub.total_exercises) * 100) : null;
                      const gradeColor = pct >= 70 ? '#4ade80' : pct >= 40 ? '#ff9800' : '#f87171';
                      return (
                        <TableRow key={sub.assignment_id} sx={{ '&:hover': { background: 'rgba(255,255,255,0.02)' } }}>
                          <TableCell sx={tc}>
                            <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{sub.student_name}</Typography>
                            <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{sub.student_email}</Typography>
                          </TableCell>
                          <TableCell sx={tc}>{sub.exam_title}</TableCell>
                          <TableCell sx={tc}>{sub.completed_at ? `${sub.score}/${sub.total_exercises}` : '—'}</TableCell>
                          <TableCell sx={tc}>
                            {pct !== null
                              ? <Chip label={`${pct}%`} size="small" sx={{ bgcolor: `${gradeColor}18`, color: gradeColor, fontWeight: 700, fontSize: 11 }} />
                              : <Chip label="Not submitted" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)', fontSize: 11 }} />}
                          </TableCell>
                          <TableCell sx={tc}>{sub.completed_at ? new Date(sub.completed_at).toLocaleDateString() : '—'}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </Box>
      )}

      {/* ---- ANALYTICS TAB ---- */}
      {tab === 4 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={darkCard}>
            <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <Typography sx={{ fontSize: 15, fontWeight: 700 }}>💡 Hint Usage</Typography>
              <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', mt: 0.3 }}>Students who used hints on your exercises</Typography>
            </Box>
            {hintUsage.length === 0 ? <EmptyState emoji="💡" text="No hints used yet" /> : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>{['Exercise','Language','Total Uses','Students'].map(h => <TableCell key={h} sx={th}>{h}</TableCell>)}</TableRow>
                  </TableHead>
                  <TableBody>
                    {hintUsage.map((row, i) => (
                      <TableRow key={i} sx={{ '&:hover': { background: 'rgba(255,255,255,0.02)' } }}>
                        <TableCell sx={{ ...tc, maxWidth: 240 }}><Typography noWrap>{row.question_text}</Typography></TableCell>
                        <TableCell sx={tc}><Chip label={row.language?.toUpperCase()} size="small" sx={{ bgcolor: 'rgba(100,255,218,0.08)', color: '#64ffda', fontSize: 11 }} /></TableCell>
                        <TableCell sx={tc}><Chip label={`${row.total_hint_uses}×`} size="small" sx={{ bgcolor: 'rgba(255,152,0,0.1)', color: '#ff9800', fontWeight: 700, fontSize: 11 }} /></TableCell>
                        <TableCell sx={tc}>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {row.students_who_used_hint?.map((s, j) => (
                              <Chip key={j} label={s.student_name} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', fontSize: 11 }} />
                            ))}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>

          <Box sx={darkCard}>
            <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <Typography sx={{ fontSize: 15, fontWeight: 700 }}>🔁 Retry Statistics</Typography>
            </Box>
            {(!retryStats.exerciseRetries?.length && !retryStats.examRetries?.length)
              ? <EmptyState emoji="🔁" text="No retries yet" />
              : (
                <Box>
                  {retryStats.exerciseRetries?.length > 0 && (
                    <>
                      <Typography sx={{ px: 2.5, pt: 2, pb: 1, fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>Exercises</Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>{['Student','Exercise','Attempts','Done?'].map(h => <TableCell key={h} sx={th}>{h}</TableCell>)}</TableRow>
                          </TableHead>
                          <TableBody>
                            {retryStats.exerciseRetries.map((row, i) => (
                              <TableRow key={i} sx={{ '&:hover': { background: 'rgba(255,255,255,0.02)' } }}>
                                <TableCell sx={tc}>{row.student_name}</TableCell>
                                <TableCell sx={{ ...tc, maxWidth: 200 }}><Typography noWrap>{row.question_text}</Typography></TableCell>
                                <TableCell sx={tc}><Chip label={`${row.attempt_count}×`} size="small" sx={{ bgcolor: 'rgba(167,139,250,0.1)', color: '#a78bfa', fontWeight: 700, fontSize: 11 }} /></TableCell>
                                <TableCell sx={tc}><Chip label={row.completed ? '✅' : '⏳'} size="small" sx={{ bgcolor: row.completed ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.05)', color: row.completed ? '#4ade80' : 'rgba(255,255,255,0.3)', fontSize: 11 }} /></TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </>
                  )}
                  {retryStats.examRetries?.length > 0 && (
                    <>
                      <Typography sx={{ px: 2.5, pt: 2, pb: 1, fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>Exams</Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>{['Student','Exam','Attempts','Last Score'].map(h => <TableCell key={h} sx={th}>{h}</TableCell>)}</TableRow>
                          </TableHead>
                          <TableBody>
                            {retryStats.examRetries.map((row, i) => (
                              <TableRow key={i} sx={{ '&:hover': { background: 'rgba(255,255,255,0.02)' } }}>
                                <TableCell sx={tc}>{row.student_name}</TableCell>
                                <TableCell sx={tc}>{row.exam_title}</TableCell>
                                <TableCell sx={tc}><Chip label={`${row.attempt_count}×`} size="small" sx={{ bgcolor: 'rgba(167,139,250,0.1)', color: '#a78bfa', fontWeight: 700, fontSize: 11 }} /></TableCell>
                                <TableCell sx={tc}>{row.score != null ? <Chip label={`${row.score} correct`} size="small" sx={{ bgcolor: 'rgba(100,255,218,0.08)', color: '#64ffda', fontSize: 11 }} /> : '—'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </>
                  )}
                </Box>
              )}
          </Box>
        </Box>
      )}

      {/* ---- DIALOGS ---- */}
      {/* Exercise Form */}
      <Dialog open={showExerciseForm} onClose={() => setShowExerciseForm(false)} maxWidth="md" fullWidth
        PaperProps={{ sx: { background: '#0d1228', border: '1px solid rgba(100,255,218,0.15)', borderRadius: '20px' } }}>
        <DialogTitle sx={{ color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.07)', fontSize: 16, fontWeight: 700 }}>Create New Exercise</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TeacherExerciseForm onCreated={() => { setShowExerciseForm(false); fetchAll(); }} />
        </DialogContent>
      </Dialog>

      {/* Exam Form */}
      <Dialog open={showExamForm} onClose={() => setShowExamForm(false)} maxWidth="md" fullWidth
        PaperProps={{ sx: { background: '#0d1228', border: '1px solid rgba(167,139,250,0.15)', borderRadius: '20px' } }}>
        <DialogTitle sx={{ color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.07)', fontSize: 16, fontWeight: 700 }}>Create New Exam</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TeacherExamForm onCreated={() => { setShowExamForm(false); fetchAll(); }} />
        </DialogContent>
      </Dialog>

      {/* Edit Exercise */}
      <Dialog open={!!editExercise} onClose={() => setEditExercise(null)} maxWidth="md" fullWidth
        PaperProps={{ sx: { background: '#0d1228', border: '1px solid rgba(79,195,247,0.15)', borderRadius: '20px' } }}>
        <DialogTitle sx={{ color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.07)', fontSize: 16, fontWeight: 700 }}>Edit Exercise</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {editExercise && <EditExerciseForm exercise={editExercise} onSaved={fetchAll} onClose={() => setEditExercise(null)} />}
        </DialogContent>
      </Dialog>

      {/* Edit Exam */}
      <Dialog open={!!editExam} onClose={() => setEditExam(null)} maxWidth="md" fullWidth
        PaperProps={{ sx: { background: '#0d1228', border: '1px solid rgba(79,195,247,0.15)', borderRadius: '20px' } }}>
        <DialogTitle sx={{ color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.07)', fontSize: 16, fontWeight: 700 }}>Edit Exam</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {editExam && <EditExamForm exam={editExam} onSaved={fetchAll} onClose={() => setEditExam(null)} />}
        </DialogContent>
      </Dialog>

      {/* Publish Exam */}
      <Dialog open={!!publishDialog} onClose={() => setPublishDialog(null)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { background: '#0d1228', border: '1px solid rgba(100,255,218,0.15)', borderRadius: '20px' } }}>
        <DialogTitle sx={{ color: '#fff', fontSize: 15, fontWeight: 700 }}>
          Publish {publishDialog?.title}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', mb: 2 }}>Select which students receive this exam:</Typography>
          {students.length === 0 ? <EmptyState emoji="👥" text="No students yet" /> : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {students.map(st => <StudentChip key={st.id} student={st} selected={selectedStudents.includes(st.id)} onToggle={id => toggleStudent(id, selectedStudents, setSelectedStudents)} />)}
              <Box onClick={() => setSelectedStudents(students.map(s => s.id))}
                sx={{ display: 'flex', alignItems: 'center', px: 1.5, py: 0.8, borderRadius: '10px', cursor: 'pointer', border: '1px solid rgba(100,255,218,0.2)', color: '#64ffda', fontSize: 12, fontWeight: 600, '&:hover': { background: 'rgba(100,255,218,0.06)' } }}>
                Select All
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setPublishDialog(null)} sx={{ color: 'rgba(255,255,255,0.4)', textTransform: 'none' }}>Cancel</Button>
          <Button variant="contained" onClick={publishExam} startIcon={<SendIcon />}
            sx={{ background: 'linear-gradient(135deg, #64ffda, #4fc3f7)', color: '#0b0920', fontWeight: 700, borderRadius: '10px', textTransform: 'none' }}>
            Publish to {selectedStudents.length} student(s)
          </Button>
        </DialogActions>
      </Dialog>

      {/* Publish Exercise */}
      <Dialog open={!!publishExercise} onClose={() => setPublishExercise(null)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { background: '#0d1228', border: '1px solid rgba(100,255,218,0.15)', borderRadius: '20px' } }}>
        <DialogTitle sx={{ color: '#fff', fontSize: 15, fontWeight: 700 }}>Publish Exercise</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', mb: 2 }}>
            {publishExercise?.question_text?.slice(0, 60)}...
          </Typography>
          {students.length === 0 ? <EmptyState emoji="👥" text="No students yet" /> : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {students.map(st => <StudentChip key={st.id} student={st} selected={selectedStudentsForEx.includes(st.id)} onToggle={id => toggleStudent(id, selectedStudentsForEx, setSelectedStudentsForEx)} />)}
              <Box onClick={() => setSelectedStudentsForEx(students.map(s => s.id))}
                sx={{ display: 'flex', alignItems: 'center', px: 1.5, py: 0.8, borderRadius: '10px', cursor: 'pointer', border: '1px solid rgba(100,255,218,0.2)', color: '#64ffda', fontSize: 12, fontWeight: 600, '&:hover': { background: 'rgba(100,255,218,0.06)' } }}>
                Select All
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setPublishExercise(null)} sx={{ color: 'rgba(255,255,255,0.4)', textTransform: 'none' }}>Cancel</Button>
          <Button variant="contained" onClick={publishExerciseNow} startIcon={<AssignmentIcon />}
            sx={{ background: 'linear-gradient(135deg, #64ffda, #4fc3f7)', color: '#0b0920', fontWeight: 700, borderRadius: '10px', textTransform: 'none' }}>
            Publish to {selectedStudentsForEx.length} student(s)
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default TeacherDashboard;