import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate , useParams} from 'react-router-dom';
import DragAndDropQuiz from '../Components/Game/DragAndDropQuiz';
import { useTopics } from '../Components/TopicsContext';


// import DragAndDropQuiz from '../Component/DragAndDropQuiz';
// import { useSyllabus } from '../Component/SyllabusContext';

function HTMLPage() {
    // const syllabus =  useSyllabus();
    const [questions , setQuestions] = useState([]);
    const location = useLocation();
  
    const navigate =useNavigate ();
  
    const {challengeNum ,levelNum ,topic , language ,syllabusId}  = useParams();

    useEffect(()=>{
      fetch(`http://localhost:3001/api/QA/getAllQuestionAndAnswer/${syllabusId}/${language}`)
        .then(res => res.json())
        .then(data => {
          setQuestions(data);
        })
        .catch(error => {
          console.error('Error during fetching topics:', error);
        });
  },[])
    console.log(questions);
    
    // Get questions for the specified levelNumber
    const levelQuestions = questions[levelNum]; 
    console.log(levelQuestions);
    
    // const language = language_Topics.split("_")[0];
    // const progress = JSON.parse(localStorage.getItem('progress'))
    
    // useEffect(() => {
    //   fetch("https://codingname.onrender.com/api/user/progress", {
    //     method: "PUT",
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'Authorization': `Bearer ${localStorage.getItem('token')}`
    //     },
    //     body: JSON.stringify({ progress: progress }),
    //   })
    //     .then((res) => res.json())
    //     .then((data) => console.log(data))
    //     .catch((err) => {
    //       console.log(err);
    //     });
    // }, [progress]);
    
 

    // useEffect (() =>{
    //   if(levelNum <= 2){
    //     console.log("...fetching"); 
    //       fetch(`https://codingname.onrender.com/api/question/${language}/${topic}/${parseInt(levelNum)}`).then(res => res.json()).then(data => setQuestionArr(data.questions)).catch((err)=>{
    //         navigate(`/dashboard/`)
    //       });
    //   }
    //   else{
    //     navigate(`/dashboard/${language}_Topics`, {
    //         state : topic
    //     })
    //   }
    // },[])
 
  return (
    <>
    <div className='p-4 md:p-8 lg:p-12 xl:p-16'>
  
    <div className='p-4 md:p-8 lg:p-12 xl:p-16'>
    {(questions.length !== 0) && <DragAndDropQuiz 
       syllabusId= {syllabusId}
       question= {levelQuestions[challengeNum].question_text}
       availableBlocks={levelQuestions[challengeNum].answer_values}
       answer={levelQuestions[challengeNum].answer_values}
       level={levelNum}
       qNum = {challengeNum}
       lan = {language}
       topic = {topic}
       allQuestionNum = {2}
       reward ={levelQuestions[challengeNum].reward}
 
       />
    }

    </div>
   
    </div>

    </>
  )
}

export default HTMLPage