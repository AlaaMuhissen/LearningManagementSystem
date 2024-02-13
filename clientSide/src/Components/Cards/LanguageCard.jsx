import React from 'react';
import { getIconComponent } from '../Logics/createIconComponent';
import { useNavigate } from 'react-router-dom';
import './Card.css'

export default function LanguageCard({ icon, title , syllabusId}) {

  const IconComponent = getIconComponent(icon, '3rem', '#100F15'); 

  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/dashboard/${syllabusId}/${title}`);
  };

  return (
<>
    <div className="jigsaw1" onClick={handleClick}>
	  <span className="t"></span>
	  <span className="r"></span>
	  <span className="b"></span>
	  <span className="l"></span>
  <span className="text">{IconComponent}</span>
	</div>


  </>
    // <div className='w-full  rounded-lg md:w-1/2 lg:w-1/3 xl:w-1/4 max-w-48 mx-auto overflow-hidden transition-transform duration-300 hover:scale-105  h-full max-h-40 cursor-pointer hover:shadow-lg' style={{ backgroundImage: `url('https://images.unsplash.com/photo-1519681393784-d120267933ba?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1124&q=100')`,
    // backgroundPosition: "center"}}>
    // <div
    // className="px-16 py-10 shadow-lg max-sm:px-8 backdrop-filter border border-[#FF4CB7] rounded-lg p-4 backdrop-blur-3xl"
    // onClick={handleClick}
    // >
  

    
    //   <div className="flex justify-center items-center">{IconComponent}</div>
      
    //   {/* <div className="mt-4 md:mt-6">
     
    //   // </div> */}
    // </div>
    // </div>
  );
}
