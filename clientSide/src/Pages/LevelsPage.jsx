import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
// import LevelCard from '../Component/CreateCard/LevelCard';

import { useTopics } from '../Components/TopicsContext';
import HtmlTitle from '../Components/HtmlTitle';
import LevelCard from '../Components/Cards/LevelCard';


function LevelsPage() {
  const {language ,topic , syllabusId} = useParams();
 
  const topics = useTopics();
  console.log(topics);
  
  const levels = topics.filter(top => top.topic_name === topic);


  return (
     <>
      <div className='p-4 md:p-8 lg:p-12 xl:p-16'>
      
            <HtmlTitle title={"Pick Your Playground and Let the Fun Begin "}/>
    <div className='flex flex-wrap '>
       {
        levels?.map((details ,i ) => (
          <LevelCard
            key= {i}
            syllabusId = {syllabusId}
            language= {language}
            topic ={topic}
            levelNumber= {details.level_id}
            questionNum={details.questionsNum} 
            />
       ))
       }
       </div>
      </div>
     </>
  )
}

export default LevelsPage