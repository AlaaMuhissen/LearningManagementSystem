import React from 'react'
import { useNavigate } from 'react-router-dom'
import LanguageCard from './LanguageCard';

function LevelCard({syllabusId ,language,topic,levelNumber,questionNum,questions }) {
  const navigate = useNavigate();
  console.log(questions);

//   const progress = JSON.parse(localStorage.getItem("progress"));
  
//   const currentQuestion = progress?.find((progressItem) => progressItem.name === language)?.topics
//     .find((topicData) => topicData.name === topic)?.levels[parseInt(levelNumber) - 1]?.currentQuestion || 0;

   
  
//     const levelStatus = progress?.find((progressItem) => progressItem.name === language)?.topics
//       .find((topicData) => topicData.name === topic)?.levels[parseInt(levelNumber) - 1].completed;
     

  const handleClick = () =>{
    navigate(`/dashboard/${syllabusId}/${language}/${topic}/levels/${levelNumber}/challenges`, {
      state: { questions ,levelNumber},
  
    });
  }
  return (
    <>
  <div
    className={`w-full md:w-1/2 lg:w-1/3 xl:w-1/4 max-w-48 mx-auto bg-white rounded-md overflow-hidden shadow-lg transform transition-transform duration-300 hover:scale-105 h-full max-h-40 mb-5 cursor-pointer `}
    //  ${levelStatus ? 'opacity-50' : 'opacity-100'}
    onClick={handleClick}
  >
    <div className="mt-2 md:mt-4">
      <h2 className='font-bold text-lg md:text-xl mb-2 text-[#4E75FF] mx-auto text-center' style={{fontFamily :'cursive'}}>
        Level {levelNumber}
      </h2>
      {/* <div className="font-bold text-lg md:text-xl mb-2 text-[#FF4CB7] mx-auto text-center" style={{fontFamily :'cursive'}}>
        {currentQuestion} of {questionNum}
      </div> */}
    </div>
  </div>
</>

  );
};

export default LevelCard