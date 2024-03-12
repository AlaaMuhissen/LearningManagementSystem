import React from 'react';
import LanguageCard from '../Components/Cards/LanguageCard';
import HtmlTitle from '../Components/HtmlTitle';
import { useSyllabus } from '../Components/SyllabusContext';

function TitlePage() {
  const syllabus = useSyllabus();
  
  return (
    <div className='p-2 md:p-4 lg:p-12 xl:p-14'>
      <HtmlTitle title={"Language To Learn"} />
      <div className='flex flex-wrap justify-center'>
        {syllabus && syllabus?.map((lan, i) => (
          <LanguageCard icon={lan.icon} title={lan.lanName} syllabusId={lan.id} key={i} />
        ))}
      </div>
    </div>
  );
}

export default TitlePage;
