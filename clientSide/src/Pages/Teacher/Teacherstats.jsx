import API_URL from '../../config/api.js';
import { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Avatar } from '@mui/material';
import { useAuth } from '../../Components/Login/AuthContext';
import { getAuth } from 'firebase/auth';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid, Legend,
  RadialBarChart, RadialBar
} from 'recharts';

const COLORS = ['#64ffda', '#4fc3f7', '#a78bfa', '#ffd700', '#f97316', '#ec4899'];

const card = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '20px',
  padding: '24px',
  transition: 'all 0.3s',
};

function AnimatedNumber({ value, duration = 1200 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = value / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return display;
}

function StatCard({ emoji, label, value, color, sub }) {
  return (
    <Box sx={{
      ...card,
      flex: 1, minWidth: 160,
      '&:hover': { border: `1px solid ${color}44`, transform: 'translateY(-4px)', boxShadow: `0 16px 40px ${color}15` }
    }}>
      <Box sx={{
        width: 48, height: 48, borderRadius: '14px',
        background: `${color}18`, border: `1px solid ${color}33`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, mb: 2,
      }}>{emoji}</Box>
      <Typography sx={{ fontSize: 32, fontWeight: 900, color, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
        <AnimatedNumber value={value} />
      </Typography>
      <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#fff', mt: 0.5 }}>{label}</Typography>
      {sub && <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', mt: 0.3 }}>{sub}</Typography>}
    </Box>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{
      background: 'rgba(13,18,40,0.95)',
      border: '1px solid rgba(100,255,218,0.2)',
      borderRadius: '12px', p: 1.5,
    }}>
      <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', mb: 0.5 }}>{label}</Typography>
      {payload.map((p, i) => (
        <Typography key={i} sx={{ fontSize: 13, fontWeight: 700, color: p.color }}>
          {p.name}: {p.value}
        </Typography>
      ))}
    </Box>
  );
};

export default function TeacherStats() {
  const { userData, authToken, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const auth = getAuth();

  const refreshIdToken = async () => {
    const user = auth.currentUser;
    if (user) {
      const freshToken = await user.getIdToken(true);
      updateUser({ ...authToken, token: freshToken });
      return freshToken;
    }
  };

  useEffect(() => {
    const fetch_ = async () => {
      if (!userData?.id) return;
      const token = await refreshIdToken();
      const h = { Authorization: `Bearer ${token}` };
      const [stRes, exRes, examRes, exSubRes, examSubRes, hintRes] = await Promise.all([
        fetch(`${API_URL}/api/teacher/students/${userData.id}`, { headers: h }),
        fetch(`${API_URL}/api/teacher/exercises/${userData.id}`, { headers: h }),
        fetch(`${API_URL}/api/teacher/exams/${userData.id}`, { headers: h }),
        fetch(`${API_URL}/api/teacher/exerciseSubmissions/${userData.id}`, { headers: h }),
        fetch(`${API_URL}/api/teacher/examSubmissions/${userData.id}`, { headers: h }),
        fetch(`${API_URL}/api/teacher/hintUsage/${userData.id}`, { headers: h }),
      ]);
      const [students, exercises, exams, exSubs, examSubs, hints] = await Promise.all([
        stRes.json(), exRes.json(), examRes.json(),
        exSubRes.json(), examSubRes.json(), hintRes.json(),
      ]);
      setData({
        students: Array.isArray(students) ? students : [],
        exercises: Array.isArray(exercises) ? exercises : [],
        exams: Array.isArray(exams) ? exams : [],
        exSubs: Array.isArray(exSubs) ? exSubs : [],
        examSubs: Array.isArray(examSubs) ? examSubs : [],
        hints: Array.isArray(hints) ? hints : [],
      });
      setLoading(false);
    };
    fetch_();
  }, [userData?.id]);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: 2 }}>
      <Typography sx={{ fontSize: 36 }}>📊</Typography>
      <CircularProgress sx={{ color: '#64ffda' }} size={28} />
    </Box>
  );

  const { students, exercises, exams, exSubs, examSubs, hints } = data;

  // Derived stats
  const completedExSubs = exSubs.filter(s => s.completed).length;
  //const completedExamSubs = examSubs.filter(s => s.completed_at).length;
  const totalHints = hints.reduce((a, h) => a + (h.total_hint_uses || 0), 0);
  const avgExamScore = examSubs.filter(s => s.score != null).length > 0
    ? Math.round(examSubs.filter(s => s.score != null).reduce((a, s) => a + (s.score / s.total_exercises) * 100, 0) / examSubs.filter(s => s.score != null).length)
    : 0;

  // Exercise by language
  const byLang = exercises.reduce((acc, ex) => {
    acc[ex.language] = (acc[ex.language] || 0) + 1;
    return acc;
  }, {});
  const langData = Object.entries(byLang).map(([name, value]) => ({ name: name.toUpperCase(), value }));

  // Exercise by level
  const byLevel = exercises.reduce((acc, ex) => {
    const label = ['', 'Guided', 'Build', 'Free Code'][ex.level] || `L${ex.level}`;
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});
  const levelData = Object.entries(byLevel).map(([name, value]) => ({ name, value }));

  // Student completion rate per exercise
  const completionData = exSubs.reduce((acc, sub) => {
    const key = sub.question_text?.slice(0, 20) + '…';
    if (!acc[key]) acc[key] = { name: key, done: 0, pending: 0 };
    sub.completed ? acc[key].done++ : acc[key].pending++;
    return acc;
  }, {});
  const completionChartData = Object.values(completionData).slice(0, 6);

  // Exam score distribution
  const scoreRanges = { '0-40%': 0, '40-70%': 0, '70-100%': 0 };
  examSubs.filter(s => s.score != null).forEach(s => {
    const pct = (s.score / s.total_exercises) * 100;
    if (pct < 40) scoreRanges['0-40%']++;
    else if (pct < 70) scoreRanges['40-70%']++;
    else scoreRanges['70-100%']++;
  });
  const scoreDistData = Object.entries(scoreRanges).map(([name, value]) => ({ name, value }));

  // Radial data for overview
  const radialData = [
    { name: 'Completion', value: exSubs.length > 0 ? Math.round((completedExSubs / exSubs.length) * 100) : 0, fill: '#64ffda' },
    { name: 'Exam Pass', value: avgExamScore, fill: '#4fc3f7' },
  ];

  // Top students by exam score
  const studentScores = examSubs
    .filter(s => s.score != null)
    .reduce((acc, s) => {
      if (!acc[s.student_name]) acc[s.student_name] = { name: s.student_name, total: 0, count: 0 };
      acc[s.student_name].total += (s.score / s.total_exercises) * 100;
      acc[s.student_name].count++;
      return acc;
    }, {});
  const topStudents = Object.values(studentScores)
    .map(s => ({ ...s, avg: Math.round(s.total / s.count) }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 5);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, display: 'flex', flexDirection: 'column', gap: 3 }}>

      {/* Header */}
      <Box>
        <Typography sx={{ fontSize: 26, fontWeight: 900, color: '#fff' }}>
          📊 Analytics & Stats
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', mt: 0.3 }}>
          Everything you need to know about your class
        </Typography>
      </Box>

      {/* Top stat cards */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <StatCard emoji="👥" label="Students" value={students.length} color="#64ffda" sub="Joined your class" />
        <StatCard emoji="🏋️" label="Exercises" value={exercises.length} color="#4fc3f7" sub="Created by you" />
        <StatCard emoji="📝" label="Exams" value={exams.length} color="#a78bfa" sub={`${exams.filter(e => e.published).length} published`} />
        <StatCard emoji="✅" label="Completions" value={completedExSubs} color="#4ade80" sub={`of ${exSubs.length} assigned`} />
        <StatCard emoji="🎯" label="Avg Score" value={avgExamScore} color="#ffd700" sub="% on exams" />
        <StatCard emoji="💡" label="Hints Used" value={totalHints} color="#f97316" sub="Across all exercises" />
      </Box>

      {/* Row 1 — Radial + Exercise by language */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>

        {/* Radial overview */}
        <Box sx={{ ...card, flex: '0 0 260px' }}>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#fff', mb: 2 }}>Class Overview</Typography>
          <RadialBarChart width={210} height={200} innerRadius={40} outerRadius={90} data={radialData} startAngle={90} endAngle={-270}>
            <RadialBar dataKey="value" cornerRadius={8} background={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Tooltip content={<CustomTooltip />} />
          </RadialBarChart>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
            {radialData.map((d, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: d.fill }} />
                  <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{d.name}</Typography>
                </Box>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: d.fill }}>{d.value}%</Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Exercise by language pie */}
        <Box sx={{ ...card, flex: 1, minWidth: 240 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#fff', mb: 2 }}>Exercises by Language</Typography>
          {langData.length === 0
            ? <Typography sx={{ color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>No exercises yet</Typography>
            : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <PieChart width={180} height={180}>
                  <Pie data={langData} dataKey="value" cx={85} cy={85} outerRadius={75} innerRadius={40} paddingAngle={3}>
                    {langData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {langData.map((d, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '3px', background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                      <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{d.name}</Typography>
                      <Typography sx={{ fontSize: 12, fontWeight: 700, color: COLORS[i % COLORS.length], ml: 'auto', pl: 1 }}>{d.value}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
        </Box>

        {/* Exercise by level */}
        <Box sx={{ ...card, flex: 1, minWidth: 240 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#fff', mb: 2 }}>Exercises by Level</Typography>
          {levelData.length === 0
            ? <Typography sx={{ color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>No exercises yet</Typography>
            : (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={levelData} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Exercises" radius={[6, 6, 0, 0]}>
                    {levelData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
        </Box>
      </Box>

      {/* Row 2 — Completion bar chart + Score distribution */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>

        {/* Student completion per exercise */}
        <Box sx={{ ...card, flex: 2, minWidth: 300 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#fff', mb: 2 }}>
            Exercise Completion Rate
          </Typography>
          {completionChartData.length === 0
            ? <Typography sx={{ color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>No submissions yet</Typography>
            : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={completionChartData} barSize={16}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
                  <Bar dataKey="done" name="Completed" fill="#64ffda" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pending" name="Pending" fill="rgba(255,255,255,0.08)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
        </Box>

        {/* Exam score distribution */}
        <Box sx={{ ...card, flex: 1, minWidth: 220 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#fff', mb: 2 }}>Exam Score Distribution</Typography>
          {scoreDistData.every(d => d.value === 0)
            ? <Typography sx={{ color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>No exam results yet</Typography>
            : (
              <>
                <PieChart width={180} height={180}>
                  <Pie data={scoreDistData} dataKey="value" cx={85} cy={85} outerRadius={75} innerRadius={40} paddingAngle={3}>
                    <Cell fill="#f87171" />
                    <Cell fill="#ffd700" />
                    <Cell fill="#4ade80" />
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8, mt: 1 }}>
                  {[['0–40%', '#f87171', '😟'], ['40–70%', '#ffd700', '👍'], ['70–100%', '#4ade80', '🏆']].map(([label, color, emoji], i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <span style={{ fontSize: 14 }}>{emoji}</span>
                        <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{label}</Typography>
                      </Box>
                      <Typography sx={{ fontSize: 13, fontWeight: 700, color }}>{scoreDistData[i]?.value}</Typography>
                    </Box>
                  ))}
                </Box>
              </>
            )}
        </Box>
      </Box>

      {/* Row 3 — Top students leaderboard */}
      <Box sx={card}>
        <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#fff', mb: 2 }}>
          🏆 Top Students by Exam Score
        </Typography>
        {topStudents.length === 0
          ? <Typography sx={{ color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>No exam scores yet</Typography>
          : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {topStudents.map((st, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {/* Rank */}
                  <Typography sx={{
                    fontSize: i < 3 ? 20 : 13,
                    fontWeight: 700,
                    color: ['#ffd700', 'rgba(255,255,255,0.5)', '#f97316'][i] || 'rgba(255,255,255,0.3)',
                    minWidth: 28, textAlign: 'center',
                  }}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                  </Typography>
                  {/* Avatar */}
                  <Avatar sx={{
                    width: 34, height: 34, fontSize: 13, fontWeight: 700,
                    background: `linear-gradient(135deg, ${COLORS[i % COLORS.length]}, ${COLORS[(i + 1) % COLORS.length]})`,
                    color: '#0b0920',
                  }}>
                    {st.name?.charAt(0)?.toUpperCase()}
                  </Avatar>
                  {/* Name */}
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#fff', flex: 1 }}>{st.name}</Typography>
                  {/* Progress bar */}
                  <Box sx={{ flex: 2, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                    <Box sx={{
                      height: '100%', width: `${st.avg}%`,
                      background: `linear-gradient(90deg, ${COLORS[i % COLORS.length]}, ${COLORS[(i + 1) % COLORS.length]})`,
                      borderRadius: 99,
                      transition: 'width 1s ease',
                      boxShadow: `0 0 8px ${COLORS[i % COLORS.length]}66`,
                    }} />
                  </Box>
                  {/* Score */}
                  <Typography sx={{ fontSize: 13, fontWeight: 800, color: COLORS[i % COLORS.length], minWidth: 40, textAlign: 'right' }}>
                    {st.avg}%
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
      </Box>

      {/* Row 4 — Hint usage per exercise */}
      {hints.length > 0 && (
        <Box sx={card}>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#fff', mb: 2 }}>
            💡 Hint Usage per Exercise
          </Typography>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={hints.map(h => ({ name: h.question_text?.slice(0, 18) + '…', hints: h.total_hint_uses }))} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="hints" name="Hints Used" fill="#f97316" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}

    </Box>
  );
}