import React, { useEffect, useState } from 'react'
import { IoIosArrowBack ,IoIosArrowForward } from "react-icons/io";

import LanguageCard from '../Components/Cards/LanguageCard';
import HtmlTitle from '../Components/HtmlTitle';


function TitlePage() {
  const syllabus = {"_id":{"$oid":"65ad09aada521fbc1d524387"},"syllabusCreator":"main","syllabusContent":[{"language":"html","icon":"TbFileTypeHtml","levelNum":{"$numberInt":"4"},"topics":["Basic_HTML_Structure","Headings_and_Paragraphs","Lists_and_Line_Breaks","Adding_Images","Adding_Links","Adding_Videos","Creating_Forms","Embedding_iframes","Semantic_HTML"],"minLevelQuestion":{"$numberInt":"5"},"maxPoints":{"$numberInt":"100"},"minPoints":{"$numberInt":"50"},"lanName":"html"},{"language":"css","icon":"PiFileCssBold","levelNum":{"$numberInt":"4"},"topics":["Basic CSS Syntax","Color and Background","Fonts and Text Styling","Box Model","Display and Position","Flexbox Basics","Grid Basics"],"minLevelQuestion":{"$numberInt":"5"},"maxPoints":{"$numberInt":"100"},"minPoints":{"$numberInt":"50"},"lanName":"css"}]};
  
  return (
     <>
     <div className='p-4 md:p-8 lg:p-12 xl:p-14'>
        
       <HtmlTitle title={"Language To Learn"} />
        <div className='flex flex-wrap '>
        {
          
            syllabus&& syllabus.syllabusContent?.map((lan, i) => (
            
                <LanguageCard icon= {lan.icon} title= {lan.lanName} key={i} />
            ))
        }
        </div>
       </div>
     </>
  )
}

export default TitlePage