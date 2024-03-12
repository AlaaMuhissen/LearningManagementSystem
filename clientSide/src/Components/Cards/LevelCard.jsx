import React, { useEffect ,useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../Login/AuthContext';
import { useTopics } from '../TopicsContext';
import { FaLock } from "react-icons/fa";

function LevelCard({syllabusId ,language,topic,levelNumber }) {

  const navigate = useNavigate();
  const [levelStatus, setLevelStatus] = useState(false);
  const [currQuestion, setCurrQuestion] = useState(0);
  const [totalQuestion ,setTotalQuestion] = useState(0);
  const {userData} = useAuth();
  const studentId = userData?.id;
  const topics = useTopics();

  const topicData = topics.find(top => top.topic_name === topic);
 
  const handleClick = () =>{
    navigate(`/dashboard/${syllabusId}/${language}/${topic}/levels/${levelNumber}/challenges`);
  }

  const fetchLevelsProgressData = async () => {
    try {
      if (studentId && topicData) {
        const response = await fetch(`http://localhost:3001/api/progress/getLevelStatus/${syllabusId}/${topicData.language_id}/${topicData.topic_name}/${levelNumber}/${studentId}`);
        const data = await response.json();
        setLevelStatus(() => data.isTopicCompleted);
        setCurrQuestion(()=> data.currQuestion);
      
      }
    } catch (error) {
      console.error('Error fetching progress data:', error);
  
    }
  };
  const fetchQuestionNum = async () => {
    try {
      if (studentId && topicData) {
        const response = await fetch(`http://localhost:3001/api/progress/getQuestionNum/${syllabusId}/${topicData?.language_id}/${topicData?.id}/${levelNumber}`);
        const data = await response.json();
        setTotalQuestion(data.questionsNum);
      }
    } catch (error) {
      console.error('Error fetching progress data:', error);

    }
  };

  useEffect(() => {
        fetchLevelsProgressData();
        fetchQuestionNum();
  },[studentId,topicData]);

return (
  <>

    <div className={`w-full md:w-1/2  max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto bg-white rounded-md overflow-hidden shadow-lg transform transition-transform duration-300 hover:scale-105 h-full max-h-40 mb-5 cursor-pointer ${(!levelStatus && levelNumber !== 1) ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}
      onClick={handleClick}
    >
      <div className="mt-2 md:mt-4">
        <h2 className='font-bold text-lg md:text-xl mb-2 text-[#4E75FF] mx-auto text-center' style={{fontFamily: 'cursive'}}>
          Level {levelNumber}
        </h2>

        {!levelStatus && levelNumber !== 1 ? (
          <div className='flex justify-center items-center'>
            <FaLock className="text-[#FF4CB7] text-xl md:text-2xl" />
          </div>
        ) : (
          <div className="font-bold text-lg md:text-xl mb-2 text-[#FF4CB7] mx-auto text-center" style={{fontFamily: 'cursive'}}>
            {(currQuestion === 1  && !levelStatus) ? `${currQuestion - 1} of ${totalQuestion}` : `${currQuestion} of ${totalQuestion}`}
          </div>
        )}
      </div>
    </div>

  </>
);

};

export default LevelCard