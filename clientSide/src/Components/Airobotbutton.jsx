import API_URL from '../config/api.js';
import { useState, useRef, useEffect } from 'react';
import { Box, Typography, TextField, IconButton, CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from './Login/AuthContext';
import { useActiveExercise } from './ActiveExerciseContext';

// ---- Theme tokens (shared with rest of app) ----
const TEAL = '#64ffda';
const BLUE = '#4fc3f7';
const PURPLE = '#a78bfa';

const STUDENT_GREETING = "Hi! I'm your coding buddy 🤖 Ask me anything about your exercises — I'll help you figure it out, but I won't just hand you the answer. Where are you stuck?";
const TEACHER_GREETING = "Hi! I can help with lesson planning, reading your class stats, or general teaching advice. What's on your mind?";

/**
 * Floating animated robot button + chat panel. Mount this ONCE, globally
 * (already done in Layout.jsx) — don't render a second one per-page.
 *
 * Adapts prompt/behavior by role automatically via useAuth().
 *
 * - Student: automatically picks up whatever exercise is "active" via
 *   ActiveExerciseContext — pages that show an exercise call
 *   setActiveExercise(...) (see ActiveExerciseContext.jsx for the pattern).
 *   Nothing to pass here manually.
 * - Teacher: there's no equivalent shared "active class stats" concept, so
 *   pass `context` explicitly with whatever the teacher page already has
 *   loaded, e.g. from TeacherDashboard:
 *     <AIRobotButton context={{ studentCount, hintUsage, retryStats }} />
 */
export default function AIRobotButton({ context: teacherContext }) {
  const { userData } = useAuth();
  const role = userData?.role === 'teacher' ? 'teacher' : 'student';
  const { activeExercise } = useActiveExercise();
  const context = role === 'teacher' ? teacherContext : activeExercise;
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: 'bot', text: role === 'teacher' ? TEACHER_GREETING : STUDENT_GREETING }]);
    }
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const newMessages = [...messages, { role: 'user', text }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          message: text,
          history: newMessages.slice(0, -1), // exclude the message we're sending now
          context,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessages(m => [...m, { role: 'bot', text: "Sorry, I couldn't respond just now — try again in a moment." }]);
      } else {
        setMessages(m => [...m, { role: 'bot', text: data.reply }]);
      }
    } catch (err) {
      setMessages(m => [...m, { role: 'bot', text: "Sorry, I couldn't reach the server." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      {/* Floating button */}
      <Box
        onClick={() => setOpen(o => !o)}
        sx={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 1300,
          width: 60, height: 60, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, cursor: 'pointer',
          background: `linear-gradient(135deg, ${TEAL}, ${BLUE})`,
          boxShadow: `0 4px 24px ${TEAL}55`,
          animation: open ? 'none' : 'robot-bounce 2.4s ease-in-out infinite',
          transition: 'transform 0.2s',
          '&:hover': { transform: 'scale(1.08)' },
          '@keyframes robot-bounce': {
            '0%, 100%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(-6px)' },
          },
        }}
      >
        {open ? <CloseIcon sx={{ color: '#0d1228', fontSize: 26 }} /> : '🤖'}
        {/* Pulse ring */}
        {!open && (
          <Box sx={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: `2px solid ${TEAL}`,
            animation: 'robot-pulse 2.4s ease-out infinite',
            '@keyframes robot-pulse': {
              '0%': { transform: 'scale(1)', opacity: 0.6 },
              '100%': { transform: 'scale(1.6)', opacity: 0 },
            },
          }} />
        )}
      </Box>

      {/* Chat panel */}
      {open && (
        <Box sx={{
          position: 'fixed', bottom: 96, right: 24, zIndex: 1300,
          width: { xs: 'calc(100vw - 32px)', sm: 340 },
          height: 440,
          maxHeight: 'calc(100vh - 140px)',
          display: 'flex', flexDirection: 'column',
          borderRadius: '16px', overflow: 'hidden',
          background: 'rgba(13,18,40,0.97)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${TEAL}33`,
          boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
        }}>
          {/* Header */}
          <Box sx={{
            p: 1.75, display: 'flex', alignItems: 'center', gap: 1,
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            background: `linear-gradient(135deg, ${PURPLE}14, ${BLUE}0a)`,
          }}>
            <Box sx={{ fontSize: 20 }}>🤖</Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#e6f1ff' }}>
                {role === 'teacher' ? 'Teaching Advisor' : 'Coding Buddy'}
              </Typography>
              {role === 'student' && activeExercise ? (
                <Typography sx={{ fontSize: '0.68rem', color: TEAL, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  📌 {activeExercise.language?.toUpperCase()} · L{activeExercise.level}
                </Typography>
              ) : (
                <Typography sx={{ fontSize: '0.68rem', color: TEAL }}>● Online</Typography>
              )}
            </Box>
          </Box>

          {/* Messages */}
          <Box ref={scrollRef} sx={{ flex: 1, overflowY: 'auto', p: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {messages.map((m, i) => (
              <Box
                key={i}
                sx={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  px: 1.5, py: 1, borderRadius: '12px',
                  fontSize: '0.85rem', lineHeight: 1.4,
                  whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                  background: m.role === 'user'
                    ? `linear-gradient(135deg, ${TEAL}, ${BLUE})`
                    : 'rgba(255,255,255,0.05)',
                  color: m.role === 'user' ? '#0d1228' : '#e6f1ff',
                  fontWeight: m.role === 'user' ? 600 : 400,
                }}
              >
                {m.text}
              </Box>
            ))}
            {loading && (
              <Box sx={{ alignSelf: 'flex-start', px: 1.5, py: 1 }}>
                <CircularProgress size={16} sx={{ color: TEAL }} />
              </Box>
            )}
          </Box>

          {/* Input */}
          <Box sx={{ p: 1.25, borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: 1 }}>
            <TextField
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={role === 'teacher' ? 'Ask for advice...' : "Ask about your exercise..."}
              size="small"
              fullWidth
              multiline
              maxRows={3}
              sx={{
                '& .MuiOutlinedInput-root': {
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '10px',
                  color: '#e6f1ff',
                  fontSize: '0.85rem',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.12)' },
                  '&.Mui-focused fieldset': { borderColor: TEAL },
                },
              }}
            />
            <IconButton
              onClick={send}
              disabled={loading || !input.trim()}
              sx={{
                color: '#0d1228',
                background: `linear-gradient(135deg, ${TEAL}, ${BLUE})`,
                width: 38, height: 38, flexShrink: 0,
                '&:hover': { background: `linear-gradient(135deg, ${BLUE}, ${TEAL})` },
                '&.Mui-disabled': { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)' },
              }}
            >
              <SendIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Box>
      )}
    </>
  );
}