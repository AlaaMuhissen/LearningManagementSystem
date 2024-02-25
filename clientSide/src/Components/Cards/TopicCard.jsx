import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import img from '/abstract-colorful-cube-shapes-sculpture.jpg';
import { FaChessQueen } from "react-icons/fa";
import { useAuth } from '../Login/AuthContext';

function TopicCard({ title, language ,syllabusId  }) {
  const navigate = useNavigate();
  const [completed, setCompleted] = useState(false);
  const [languageId , setLanguageId] = useState(0);
  const{userData} = useAuth();
  const studentId = userData?.id;
  const handleClick = () => {
    navigate(`/dashboard/${syllabusId}/${language}/${title}/levels`);
  };
  
  useEffect(() => {  
    if(studentId){
      fetch(`http://localhost:3001/api/syllabus/getLanguageId/${syllabusId}/${language}`)
      .then(res => res.json())
      .then(data => {
        setLanguageId(data[0].language_id);
      })
      .catch(error => {
        console.error('Error during fetching topics:', error);
      });
      fetch(`http://localhost:3001/api/progress/getTopicStatus/${parseInt(syllabusId)}/${languageId}/${title}/${studentId}`
       )
        .then(res => res.json())
        .then(data => {
          setCompleted(data);
        })
        .catch(error => {
          console.error('Error during fetching topics:', error);
        });
    }
  }, []); 

  return (

    <div className='w-full md:w-1/2 lg:w-1/3 xl:w-1/4 max-w-48 mx-auto overflow-hidden min-h-24'>
      <div
        className="flex items-center justify-center shadow-lg bg-opacity-50 backdrop-filter backdrop-blur-sm backdrop-saturate-180 border border-[#FF4CB7] rounded-lg p-4 text-center cursor-pointer hover:shadow-lg bg-left-bottom min-h-24"
        style={{ backgroundImage: `url(${img})`, backgroundPosition: 'bottom right' }}
        onClick={handleClick}
      >
       {completed &&
         <FaChessQueen fontSize={"24px"} color={'#FFD700'}/>}
        <div className="text-balance">
          <div className="font-bold text-md text-[#fff] mb-2" style={{ fontFamily: 'cursive' }}>
            {title}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TopicCard;
