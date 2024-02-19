import React from 'react'
import { useNavigate ,useParams } from 'react-router-dom'
import { FaLock } from "react-icons/fa";
function ChallengeCard({questionNum ,question}) {
   
  const navigate = useNavigate();
  const {topic , levelNum } = useParams();
  console.log(question);
 
  // const language = useParams()["language_Topics"].split("_")[0];
  // const progress = JSON.parse(localStorage.getItem("progress"));
  
  
  // const currentQuestion = progress?.find((progressItem) => progressItem.name === language)?.topics
  //   .find((topicData) => topicData.name === topic)?.levels[parseInt(levelNum) - 1]?.currentQuestion || 0;
  
  // const status = (currentQuestion <= questionNum);
  // console.log(currentQuestion)
  //  console.log(questionNum)
  //  console.log(status);
  const handleClick = () => {
    navigate(`${questionNum} `)
  
  }

  return (
    <>
  <>
  <div
    className={`w-full md:w-1/2 lg:w-1/3 xl:w-1/4 max-w-48 mx-auto bg-white rounded-md overflow-hidden shadow-lg transform transition-transform duration-300 hover:scale-105 p-3 md:p-5 h-full max-h-40 mb-5 cursor-pointer `}
    // ${status ? 'opacity-50' : 'opacity-100'}
    onClick={handleClick}
  >
    <div className="mt-4 md:mt-3 flex justify-center items-center">
      <div className="font-bold text-lg md:text-xl mb-2 text-[#4E75FF] mx-auto text-center" style={{fontFamily :'cursive'}}>
        Challenge {questionNum}
      </div> 
       {/* {status ? */}
     <div className='flex justify-center items-center'><FaLock  fontSize={'32px'} color={'#FF4CB7'}/> </div>
    </div>
  </div>
</>

  </>
  );
};

export default ChallengeCard