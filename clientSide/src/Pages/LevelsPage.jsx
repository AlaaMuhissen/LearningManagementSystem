import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTopics } from '../Components/TopicsContext';
import HtmlTitle from '../Components/HtmlTitle';
import LevelCard from '../Components/Cards/LevelCard';

function LevelsPage() {
  const { language, topic, syllabusId } = useParams();
  const topics = useTopics();
  
  const levels = topics.filter(top => top.topic_name === topic);

  const numLevels = levels.length > 0 ? parseInt(levels[0].levelNum) : 0;

  useEffect(() => {
    //  fetch(`http://localhost:3001/api/syllabus/getLanguageId/${syllabusId}/${}`).then()
     

  },[])

  return (
    <>
      <div className='p-4 md:p-8 lg:p-12 xl:p-16'>
        <HtmlTitle title={"Pick Your Playground and Let the Fun Begin "} />
        <div className='flex flex-wrap'>
          {levels[0].questionNum > 0 ? ([...Array(numLevels)].map((_, i) => (
            <LevelCard
              key={i}
              syllabusId={syllabusId}
              language={language}
              topic={topic}
              levelNumber={i + 1} 
            />
          ))) :
          <div> No levels yet</div>}
        </div>
      </div>
    </>
  );
}

export default LevelsPage;
