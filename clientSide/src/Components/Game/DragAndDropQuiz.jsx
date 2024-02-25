import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DragContainer from './DragContainer';
import BlocksDiv from './BlocksDiv';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useParams, useNavigate } from 'react-router-dom';
import CodeBlock from './CodeBlock';
import useSound from 'use-sound';
import coinsSound from '/sounds/cash-register-fake-88639.mp3';
import ohNoSound from '/sounds/oh-no-113125.mp3';
import wahSound from '/sounds/wah-wah-sad-trombone-6347.mp3';
import CodeLevel from './CodeLevel';
import { useAuth } from '../Login/AuthContext';
import { usePoints } from '../PointsContext';

export default function DragAndDropQuiz({
  syllabusId,
  question,
  availableBlocks,
  answer,
  level,
  qNum,
  lan,
  lanId,
  topic,
  allQuestionNum,
  reward
}) {
  const { points, updatePoints } = usePoints();
  const navigate = useNavigate();
  const [userAnswer, setUserAnswer] = useState([]);
  const { userData  } = useAuth();
  const userId = userData?.id;
  const [isRun, setIsRun] = useState(false);
  const [counter, setCounter] = useState(0);
  const [correctAnswer, setCorrectAnswer] = useState(false);
  const [play] = useSound(coinsSound);
  const [playOhNo] = useSound(ohNoSound);
  const [playWah] = useSound(wahSound);
  const [resultHtml, setResultHtml] = useState('');

  

  useEffect(() => {
    if (correctAnswer) { 
      fetch(`http://localhost:3001/api/progress/updateProgress`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          student_id: userId,
          syllabus_id: syllabusId,
          language_id: lanId,
          topic_name: topic,
          level: level,
          questionNum: allQuestionNum
        })
      })
        .then(res => res.json())
        .then(data => {
          console.log(data);
        })
        .catch(error => {
          console.error('Error during fetching topics:', error);
        });

    }
  }, [correctAnswer]); 

  const handleCorrectAnswer = () => {
    const wrongAnswer = userAnswer.filter((ans) => ans.id !== ans.boardId);
    if (
      (userAnswer.length === answer.length &&
        userAnswer.every((obj1) =>
          answer.some((obj2) => obj1.id === obj2.id)
        )) ||
      level === 1
    ) {
      console.log('Correct!');
      setUserAnswer([]);
      setIsRun(true);
      setCounter(0);
      play();
      toast("User's answer is correct!");
      setCorrectAnswer(true);
      const newPoints = points + reward;
      
      updatePoints(newPoints);
      if (qNum >= allQuestionNum) {
        setTimeout(() => {
          navigate(`/dashboard/${syllabusId}/${lan}/${topic}/levels/${level + 1}/challenges/${1}`);
          window.location.reload();
       
        }, 2500);
      } else {
        setTimeout(() => {
          navigate(`/dashboard/${syllabusId}/${lan}/${topic}/levels/${level}/challenges/${qNum + 1}`);
          window.location.reload();
        }, 2500);
      }
      setResultHtml(userAnswer.map((block) => block.value).join(''));
    } else {
      console.log('Try Again');
      console.log(userAnswer.length);
      console.log(answer.length);
      playOhNo();
      setCorrectAnswer(false); 
    }
  };

  const handleRunButton = () => {
    setIsRun(true);
    console.log('Updated User Answer:', userAnswer);
    const is = userAnswer.filter((ans) => ans.id !== ans.boardId);
    is.length === 0 ? handleCorrectAnswer() : playWah();
  };

  return (
    <div className="w-full flex flex-col-reverse md:flex-row-reverse  item-center justify-between gap-5 md:gap-12">
    {
      parseInt(level) <= 2 ? (
        <DndProvider backend={HTML5Backend}>
         <div className="max-w-screen-sm flex flex-col item-center gap-4 sm:gap-10 md:gap-10 lg:gap-8 xl:gap-10 text-[#fff] p-2 md:p-12">
            <div className="w-full flex items-center justify-between ">
            <span className="flex flex-wrap font-bold text-base sm:text-sm md:text-xl xl:text-2xl">{question}</span>

            </div>

            <div className="max-w-screen-sm flex overflow-x-auto items-center gap-3 md:gap-4 ">

              {answer.map((drop, i) => (
                <DragContainer
                  availableBlocks={availableBlocks}
                  key={i}
                  boardId={drop.id}
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
        
            </div>
            <div className="flex justify-center">
              {parseInt(level) === 2 && <button onClick={handleRunButton}>Run</button>}
            </div>
            {
              isRun && (
                <div className="bg-white text-black rounded-lg shadow-md p-4 max-w-md mx-auto overflow-hidden">
                  <div dangerouslySetInnerHTML={{ __html: resultHtml }} />
                </div>
              )
            }
          </div>
          <BlocksDiv availableBlocks={availableBlocks} />
        </DndProvider>
      ) : (
        <CodeLevel />
      )
    }
  </div>
  
  );
}
