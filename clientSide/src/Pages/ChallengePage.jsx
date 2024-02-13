import React , {useState ,useEffect}from 'react'
import { useLocation, useParams } from 'react-router-dom';
import HtmlTitle from '../Components/HtmlTitle';
import ChallengeCard from '../Components/Cards/ChallengeCard.jsx'
import { useTopics } from '../Components/TopicsContext.jsx';

function ChallengePage() {
    const location = useLocation();
  ;
    const [questions ,setQuestions] = useState(location.state.questions);
    const {topic ,syllabusId ,language} = useParams();
    const topics = useTopics();
    console.log(topics);
    
    const levelNumber = location.state.levelNumber|| topics.filter(top => top.topic_name === topic);
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
    const levelQuestions = questions[levelNumber]; 
    console.log(levelQuestions);


    return (
        <>
            <div className='p-4 md:p-8 lg:p-12 xl:p-16'>
                <HtmlTitle title={"Embark on Your Daily Adventure, Little Explorer! "}/>
                <div className='flex flex-wrap '>
                    {levelQuestions.map((question ,index) => (
                        <ChallengeCard questionNum={index} question={levelQuestions} key={index} />
                    ))}
                </div>
            </div>
        </>
    )
}

export default ChallengePage
