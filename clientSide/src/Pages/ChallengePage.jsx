import React , {useState ,useEffect}from 'react'
import { useParams } from 'react-router-dom';
import HtmlTitle from '../Components/HtmlTitle';
import ChallengeCard from '../Components/Cards/ChallengeCard.jsx'

function ChallengePage() {
    const [questions ,setQuestions] = useState();
    const {topic ,syllabusId ,language , levelNum} = useParams();

    useEffect(()=>{
      fetch(`http://localhost:3001/api/QA/getAllQuestionAndAnswer/${syllabusId}/${language}/${topic}`)
        .then(res => res.json())
        .then(data => {
          setQuestions(data);
        })
        .catch(error => {
          console.error('Error during fetching topics:', error);
        });
  },[])
  
    // Get questions for the specified levelNumber
    const levelQuestions = questions&&questions[levelNum]; 

    return (
        <>
            <div className='p-4 md:p-8 lg:p-12 xl:p-16'>
                <HtmlTitle title={"Embark on Your Daily Adventure, Little Explorer! "}/>
                <div className='flex flex-wrap '>
                {(levelQuestions?.length === 0) || !levelQuestions ? (
                    <div className="w-full text-center text-gray-600 mt-4">No challenges yet</div>
                  ) : (
                    levelQuestions?.map((question, index) => (
                      <ChallengeCard questionNum={(index +1)} question={levelQuestions}  key={index} />
                    ))
                  )}
                </div>
            </div>
        </>
    )
}

export default ChallengePage
