import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTopics } from '../Components/TopicsContext';
import HtmlTitle from '../Components/HtmlTitle';
import LevelCard from '../Components/Cards/LevelCard';

function LevelsPage() {

  const { language, topic, syllabusId } = useParams();
  const topics = useTopics(syllabusId, language);
  
  const levels = topics?.filter(top => top.topic_name === topic);

  const numLevels = levels.length > 0 ? parseInt(levels[0].levelNum) : 0;


  return (
    <>
      <div className='p-4 md:p-8 lg:p-12 xl:p-16'>
        <HtmlTitle title={"Pick Your Playground and Let the Fun Begin "} />
        <div className='flex flex-wrap -mx-4 md:-mx-8 lg:-mx-8 xl:-mx-8'>
          {levels[0]?.questionNum > 0 ? ([...Array(numLevels)]?.map((_, i) => (
           <div key={i} className="w-full md:w-1/2 lg:w-1/3 xl:w-1/4 px-4 md:px-8 lg:px-8 xl:px-8 mb-8">
          <LevelCard
            syllabusId={syllabusId}
            language={language}
            topic={topic}
            levelNumber={i + 1} 
          />
        </div>
          ))) :
          <div className="w-full text-center text-gray-600 mt-4"> No levels yet</div>}
        </div>
      </div>

    </>
  );
}

export default LevelsPage;
