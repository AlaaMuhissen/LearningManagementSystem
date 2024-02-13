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
import coinsSound from '/sounds/cash-register-fake-88639.mp3'
import ohNoSound from '/sounds/oh-no-113125.mp3'
import wahSound from '/sounds/wah-wah-sad-trombone-6347.mp3'
import CodeLevel from './CodeLevel';
export default function DragAndDropQuiz({
  syllabusId,
  question,
  availableBlocks,
  answer,
  level,
  qNum,
  lan,
  topic,
  allQuestionNum,
  reward
}) {

  const navigate = useNavigate();
  const [userAnswer, setUserAnswer] = useState([]);
  const [isRun, setIsRun] = useState(false);
  const [counter, setCounter] = useState(0);
  // const { points, updatePoints } = usePoints();
  const [play] = useSound(coinsSound);
  const [playOhNo] = useSound(ohNoSound);
  const [playWah] = useSound(wahSound);
  const [resultHtml, setResultHtml] = useState('');

//  const progress = JSON.parse(localStorage.getItem('progress'));
//   useEffect(() => {
//     const storedPoints = localStorage.getItem('points');
//     if (storedPoints !== null) {
//       updatePoints(parseInt(storedPoints, 10));
//     }
//   }, [updatePoints]);
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
    //  const newPoints = points + reward;
  
//       const updatedProgress = progress.map((progressItem) => {
//         if (progressItem.name === lan) {
         
//           const updatedTopics = progressItem.topics.map((topicItem, index) => {
//             if (topicItem.name === topic) {
//                 const updatedLevels = topicItem.levels.map((level, i) => ({
//                   ...level,
//                   currentQuestion: i === index ? level.currentQuestion + 1 : level.currentQuestion,
//                 }));
//               return {
//                 ...topicItem,
//                 levels: updatedLevels,
//               };
//             }
//             return topicItem;
//           });
      
//           return {
//             ...progressItem,
//             topics: updatedTopics,
//           };
//         }
      
//         return progressItem;
//       });
      
//       const updatedProgressLevel = progress.map((progressItem) => {
//         if (progressItem.name === lan) {
//           progressItem.topics.forEach((topicData, index) => {
//             if (topicData.name === topic) {
//               console.log(topicData);
//               console.log(index);
//               topicData.levels[parseInt(level) - 1].completed = true;
//             }
//           });
//         }
      
//         return progressItem;
//       });
      
   
//       localStorage.setItem('progress', JSON.stringify(updatedProgress));
      
      
//       localStorage.setItem('points', newPoints);
//       updatePoints(newPoints);
  
      if (qNum + 1 >= allQuestionNum) {
        console.log('here');
        setTimeout(() => {
        //   localStorage.setItem('progress', JSON.stringify(updatedProgress));
        // localStorage.setItem('progress', JSON.stringify(updatedProgressLevel));
        // navigate(`/dashboard/${syllabusId}/${lan}/${topic}/levels/${parseInt(level)+1}/challenges`);
          navigate(`/dashboard/${syllabusId}/${lan}/${topic}/levels/${parseInt(level) + 1}/challenges/${0}`);
          window.location.reload();
       
        }, 2500);
      } else {
        setTimeout(() => {
          // navigate(`/dashboard/${syllabusId}/${lan}/${topic}/levels/${parseInt(level)}/challenges`);
          navigate(`/dashboard/${syllabusId}/${lan}/${topic}/levels/${parseInt(level)}/challenges/${parseInt(qNum) + 1}`);
          window.location.reload();
        }, 2500);
      }
      setResultHtml(userAnswer.map((block) => block.value).join(''));
    } else {
  
        console.log('Try Again');
        console.log(userAnswer.length);
        console.log(answer.length);
        playOhNo();
  
    
    }
};
  

  const handleRunButton = () => {
    setIsRun(true);
    console.log('Updated User Answer:', userAnswer);
    const is = userAnswer.filter((ans) => ans.id !== ans.boardId);
    is.length === 0 ? handleCorrectAnswer(): playWah();
  };

  return (
    <div className="flex">
    {
      parseInt(level) <= 2 ? (<DndProvider backend={HTML5Backend}>
        <BlocksDiv availableBlocks={availableBlocks} />
        <div className="flex flex-col gap-10 text-[#fff]">
          <div className="flex justify-center">
            <span className='font-bold'>{question}</span>
          </div>
          <div className="flex items-center gap-4 justify-center">
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
            <ToastContainer />
            {parseInt(level) === 2 && <button onClick={handleRunButton}>Run</button>}
          </div>
        {
          isRun && <div className="bg-white text-black rounded-lg shadow-md p-4 max-w-md mx-auto overflow-hidden">
          <div dangerouslySetInnerHTML={{ __html: resultHtml }} />
          </div>
        }  
        </div>
       
      </DndProvider>) :

      (<CodeLevel />)
    }
      
    </div>
  );
}
