import API_URL from '../../config/api.js';
import  { useState } from 'react';
import Editor from '@monaco-editor/react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../Login/AuthContext';
import HintButton from './HintButton';
import { usePoints } from '../PointsContext';

export default function CodeLevel({
  syllabusId,
  question,
  level,
  qNum,
  lan,
  lanId,
  topic,
  allQuestionNum,
  reward,
  hint,
  onHintUsed
}) {
  const [code, setCode] = useState('<!-- Write your HTML here -->\n');
  const [preview, setPreview] = useState('');
  const [hasRun, setHasRun] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const navigate = useNavigate();
  const { userData } = useAuth();
  const { points, updatePoints } = usePoints();
  const userId = userData?.id;

  const runCode = () => {
    setPreview(code);
    setHasRun(true);
  };

  // const checkIfAlreadyCompleted = async () => {
  //   try {
  //     const res = await fetch(`${API_URL}/api/progress/getLevelStatus/${syllabusId}/${lanId}/${topic}/${level}/${userId}`);
  //     const data = await res.json();
  //     return data.isTopicCompleted === true;
  //   } catch { return false; }
  // };

  const saveProgress = async () => {
    try {
      await fetch(`${API_URL}/api/progress/updateProgress`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: userId,
          syllabus_id: syllabusId,
          language_id: lanId,
          topic_name: topic,
          level,
          questionNum: allQuestionNum
        })
      });
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const handleSubmit = async () => {
    if (!hasRun) {
      toast.warning('Run your code first!');
      return;
    }

    // Basic validation — check if code contains expected HTML tags
    const codeLower = code.toLowerCase().replace(/\s/g, '');
    const hasContent = codeLower.length > 30;

    if (!hasContent) {
      toast.error('Your code looks too short. Try writing a complete solution!');
      return;
    }

    setIsCorrect(true);
    toast.success('Great job! Moving to next challenge...');
    updatePoints(points + reward);
    await saveProgress();

    setTimeout(() => {
      if (qNum >= allQuestionNum) {
        navigate(`/dashboard/${syllabusId}/${lan}/${topic}/levels/${parseInt(level) + 1}/challenges/1`);
        window.location.reload();
      } else {
        navigate(`/dashboard/${syllabusId}/${lan}/${topic}/levels/${level}/challenges/${qNum + 1}`);
        window.location.reload();
      }
    }, 2000);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full h-full text-white">
      {/* Left: question + editor */}
      <div className="flex flex-col gap-4 flex-1">
        <div className="bg-[#1e3a5f] rounded-lg p-4">
          <p className="font-bold text-base md:text-lg">{question}</p>
          <HintButton hint={hint} reward={reward} onHintUsed={onHintUsed} />
        </div>

        <div className="rounded-lg overflow-hidden border border-[#2d4a6e]">
          <Editor
            height="350px"
            language="html"
            theme="vs-dark"
            value={code}
            onChange={(val) => setCode(val || '')}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
            }}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={runCode}
            className="bg-[#4E75FF] hover:bg-[#3a5fd9] text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            ▶ Run
          </button>
          <button
            onClick={handleSubmit}
            disabled={isCorrect}
            className="bg-[#FF4CB7] hover:bg-[#e03da0] disabled:opacity-50 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            ✓ Submit
          </button>
        </div>
      </div>

      {/* Right: live preview */}
      <div className="flex flex-col flex-1 gap-2">
        <p className="font-bold text-sm text-gray-400 uppercase tracking-wider">Preview</p>
        <div className="rounded-lg overflow-hidden border border-[#2d4a6e] bg-white flex-1" style={{ minHeight: '350px' }}>
          {preview ? (
            <iframe
              title="preview"
              srcDoc={preview}
              className="w-full h-full"
              style={{ minHeight: '350px', border: 'none' }}
              sandbox="allow-scripts"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              Press ▶ Run to see your output
            </div>
          )}
        </div>
      </div>

      <ToastContainer />
    </div>
  );
}