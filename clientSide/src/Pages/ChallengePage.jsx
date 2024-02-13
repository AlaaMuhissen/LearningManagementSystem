import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom';
import HtmlTitle from '../Components/HtmlTitle';
import ChallengeCard from '../Components/Cards/ChallengeCard';

function ChallengePage() {
    const [questions ,setQuestions] = useLocation();
    useEffect(()=>{
      useEffect(() => {
        fetch(`http://localhost:3001/api/topics/getLevelAndQuestionNumForTopic/${syllabusId}/${language}`)
          .then(res => res.json())
          .then(data => {
            setQuestions(data);
          })
          .catch(error => {
            console.error('Error during fetching topics:', error);
          });
      }, [syllabusId, language]);


    },[])
  return (
   
    <>
     <div className='p-4 md:p-8 lg:p-12 xl:p-16'>
    
        <HtmlTitle title={"Embark on Your Daily Adventure, Little Explorer! "}/>
          <div className='flex flex-wrap '>

    {
      questions.map((question ,index) => (
          <ChallengeCard questionNum = {index} question = {question} key={index}
         /> 
      ))
    }
      </div>
    </div>
    </>
  )
}

export default ChallengePage