import React, { useEffect, useState } from 'react'
import { IoIosArrowBack ,IoIosArrowForward } from "react-icons/io";

import LanguageCard from '../Components/Cards/LanguageCard';
import HtmlTitle from '../Components/HtmlTitle';
import { useSyllabus } from '../Components/SyllabusContext';


function TitlePage() {
  const syllabus = useSyllabus();
  
  return (
     <>
     <div className='p-4 md:p-8 lg:p-12 xl:p-14'>
        
       <HtmlTitle title={"Language To Learn"} />
        <div className='flex flex-wrap '>
        {
          
            syllabus&& syllabus?.map((lan, i) => (
            
                <LanguageCard icon= {lan.icon} title= {lan.lanName} syllabusId={lan.id} key={i} />
            ))
        }
        </div>
       </div>
     </>
  )
}

export default TitlePage