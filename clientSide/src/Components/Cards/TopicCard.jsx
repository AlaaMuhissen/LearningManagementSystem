// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import img from '/abstract-colorful-cube-shapes-sculpture.jpg';
// import { FaChessQueen } from "react-icons/fa";

// function TopicCard({ title, language  }) {
//   const navigate = useNavigate();
//   const newTitle = title.split("_").join(" ");
//   const handleClick = () => {
//     navigate(`/dashboard/${language}_Topics/${title}/levels`);
//   };
//   const progress = JSON.parse(localStorage.getItem('progress'));
//   function areLevelsCompleted(language, topic) {
  
//     const languageData = progress.find((lang) => lang.name === language);
  
//     if (languageData) {
//       const topicData = languageData.topics.find((top) => top.name === topic);
  
//       if (topicData) {
//         const level1Completed = topicData.levels[0]?.completed || false;
//         const level2Completed = topicData.levels[1]?.completed || false;
  
//         return level1Completed && level2Completed;
//       }
//     }
  
//     return false;
//   }
 
//   const completed = areLevelsCompleted (language , title);
 
 
//   return (
//     <div className='w-full md:w-1/2 lg:w-1/3 xl:w-1/4 max-w-48 mx-auto overflow-hidden min-h-24'>
//       <div
//         className="flex items-center justify-center shadow-lg bg-opacity-50 backdrop-filter backdrop-blur-sm backdrop-saturate-180 border border-[#FF4CB7] rounded-lg p-4 text-center cursor-pointer hover:shadow-lg bg-left-bottom min-h-24"
//         style={{ backgroundImage: `url(${img})`, backgroundPosition: 'bottom right' }}
//         onClick={handleClick}
//       >
//         {completed && <FaChessQueen fontSize={"24px"} color={'#FFD700'}/>}
//         <div className="text-balance">
//           <div className="font-bold text-md text-[#fff] mb-2" style={{ fontFamily: 'cursive' }}>
//             {newTitle}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default TopicCard;
