import React, { useEffect ,useState } from 'react'
import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
import LevelProgress from './LevelProgress';

const TopicProgress = ({ syllabus_id, studentId,topic, topicProgress, calculateTopicProgress }) => {

  console.log(topicProgress);

   const [LevelProgressData, setLevelProgressData] = useState([]);
   const [LevelData, setLevelData] = useState([]);
     let sumCurrQuestion = 0;
    let totalQuestions = 0;
   console.log(topicProgress);
   const GetTopicProgressId = topicProgress?.find((item) => item.topicName === topic.topic_name);
   const topic_id_in_progress = GetTopicProgressId?.id;
   console.log(topic_id_in_progress);

   const fetchLevelsProgressData = async (topic_id ) => {
    try {
      if (studentId) {
        const response = await fetch(`http://localhost:3001/api/progress/getLevelProgress/${studentId}/${syllabus_id}/${topic_id}`);
        const data = await response.json();
        setLevelProgressData(data);
      
      }
    } catch (error) {
      console.error('Error fetching progress data:', error);
  
    }
  };
  const fetchLevelData = async (language_name , topic_name) => {
    try {
      if (studentId) {
        const response = await fetch(`http://localhost:3001/api/topics/getLevelAndQuestionNumForTopic/${syllabus_id}/${language_name}/${topic_name}`);
        const data = await response.json();
        console.log(data)
        setLevelData(data);
      }
    } catch (error) {
      console.error('Error fetching progress data:', error);

    }
  };

  useEffect(() => {
    if(topic_id_in_progress){
        fetchLevelsProgressData(topic_id_in_progress);
        fetchLevelData(topic.lanName, topic.topic_name);
    }
  },[]);
  
    const calculateLevelProgress = (topic_id_in_progress ,id, levelNum) => {

    const levelProgress = LevelProgressData.find((item) => (item.topic_id === topic_id_in_progress) && (item.level_id === levelNum));
    const level = LevelData.find((item) => (item.topic_id === id) && (item.current_Level === levelNum));
   
    if (!levelProgress || !level) return 0;
    else{

      sumCurrQuestion += parseInt(levelProgress?.currQuestion) ;
      totalQuestions += parseInt(level?.questionsNum);
      console.log(`level = ${levelNum}`);
      console.log(levelProgress);
      console.log(`level progress = ${(levelProgress?.currQuestion) / level?.questionsNum}`);
       return (levelProgress?.currQuestion / level?.questionsNum ) * 100;
  }

};

    

    return (
        <>
    {topicProgress.find((topicPro) => topicPro.topicName ===topic.topic_name) &&   
      <div className="m-8">
        <h3 className="m-8">{topic.topic_name}</h3>
        <CircularProgressbarWithChildren
            key={topic.id}
            value={parseFloat(calculateTopicProgress(topic.topic_name))}
            // text={`l=${topic.id}`}
            strokeWidth={4}
            styles={buildStyles({
            pathColor: "red",
            trailColor: "transparent"
            })}
        >
            { [...Array(topic.levelNum).keys()].map((level, i) => (
            <LevelProgress key={i} topicIdInProgress= {topic_id_in_progress} level={level} topic={topic} calculateLevelProgress={calculateLevelProgress} />
            ))}
        </CircularProgressbarWithChildren>
      </div>
}
      </>
    );
  };
  

export default TopicProgress