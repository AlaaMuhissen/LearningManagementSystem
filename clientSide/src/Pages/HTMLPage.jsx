import React, { useEffect, useState } from 'react'
import {useParams} from 'react-router-dom';
import DragAndDropQuiz from '../Components/Game/DragAndDropQuiz';

function HTMLPage() {

    const [questions , setQuestions] = useState([]);
    const [languageId , setLanguageId] = useState(0);

    const {challengeNum ,levelNum ,topic , language ,syllabusId}  = useParams();

    useEffect(()=>{
      fetch(`http://localhost:3001/api/syllabus/getLanguageId/${syllabusId}/${language}`)
      .then(res => res.json())
      .then(data => {
        setLanguageId(data[0].language_id);
      })
      .catch(error => {
        console.error('Error during fetching topics:', error);
      });
      fetch(`http://localhost:3001/api/QA/getAllQuestionAndAnswer/${syllabusId}/${language}/${topic}`)
        .then(res => res.json())
        .then(data => {
          console.log(data);
          setQuestions(data);
        })
        .catch(error => {
          console.error('Error during fetching topics:', error);
        });
  },[])
   
    // Get questions for the specified levelNumber
    const levelQuestions = questions[levelNum]; 
    console.log(levelQuestions);
  
  return (
    <>
    <div className='p-1 md:p-4 lg:p-4 '>
  
    <div>
      {(questions.length !== 0) && <DragAndDropQuiz 
        syllabusId= {parseInt(syllabusId)}
        question= {levelQuestions[(challengeNum-1)].question_text}
        availableBlocks={levelQuestions[(challengeNum -1)].answer_values}
        answer={levelQuestions[(challengeNum -1)].answer_values}
        level={parseInt(levelNum)}
        qNum = {parseInt((challengeNum))}
        lan = {language}
        lanId = {parseInt(languageId)}
        topic = {topic}
        allQuestionNum = {questions[levelNum].length}
        reward ={levelQuestions[(challengeNum -1)].reward}
        />
      }

    </div>
   
    </div>

    </>
  )
}

export default HTMLPage