import React, { useState ,useEffect} from 'react'
import { useNavigate ,useParams } from 'react-router-dom'
import { FaLock } from "react-icons/fa";
import { useTopics } from '../TopicsContext';

function ChallengeCard({questionNum}) {
  const navigate = useNavigate();
  const {syllabusId ,topic ,levelNum} = useParams();
  const [totalQuestion ,setTotalQuestion] = useState(0);
  const [status , setStatus] = useState(false);
  const topics = useTopics();

  const topicData = topics.find(top => top.topic_name === topic);
 
  const handleClick = () => {
    navigate(`${questionNum} `)
  }
  const fetchQuestionNum = async () => {
    try {
      if (topicData) {
        const response = await fetch(`http://localhost:3001/api/progress/getQuestionNum/${syllabusId}/${topicData?.language_id}/${topicData?.id}/${levelNum}`);
        const data = await response.json();
        console.log(questionNum)
        console.log(data)
        setTotalQuestion(data.questionsNum);
        if(questionNum <= data.questionsNum){
          setStatus(true);
        }else{
          setStatus(false);
        }
      }
    } catch (error) {
      console.error('Error fetching progress data:', error);

    }
  };

  useEffect(() => {
       if(questionNum === 1){
         setStatus(false);
       }
         else{
          fetchQuestionNum();
         }
       
  },[syllabusId]);


  return (

  <>
    <div
      className={`w-full md:w-1/2 lg:w-1/3 xl:w-1/4 max-w-48 mx-auto bg-white rounded-md overflow-hidden shadow-lg transform transition-transform duration-300 hover:scale-105 p-3 md:p-5 h-full max-h-40 mb-5 cursor-pointer ${status ? 'opacity-50' : 'opacity-100'} `}
      onClick={handleClick}
    >
      <div className="mt-4 md:mt-3 flex justify-center items-center">
        <div className="font-bold text-lg md:text-xl mb-2 text-[#4E75FF] mx-auto text-center" style={{fontFamily :'cursive'}}>
          Challenge {questionNum}
        </div> 
        {status ?
      (<div className='flex justify-center items-center'><FaLock  fontSize={'32px'} color={'#FF4CB7'}/> </div>) : null}
      </div>
    </div>
  </>
  );
};

export default ChallengeCard