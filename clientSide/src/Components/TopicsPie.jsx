import React, { useState, useEffect } from 'react';
import { CircularProgressbarWithChildren, CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useAuth } from '../Components/Login/AuthContext';
import TopicProgress from './TopicProgress';
import { FaSquare } from "react-icons/fa6";

const TopicsPie = ({ syllabus_id  ,language_id}) => {

    const [TopicData, setTopicData] = useState([]);
    const [TopicProgressData, setTopicProgressData] = useState([]);
    const { userData } = useAuth();
    const studentId = userData?.id;


    const fetchTopicProgressData = async () => {
    try {
      if (studentId) {
        const response = await fetch(`http://localhost:3001/api/progress/getTopicProgress/${studentId}/${syllabus_id}/${language_id}`);
        const data = await response.json();
        console.log(data)
        setTopicProgressData(data);

      }
    } catch (error) {
      console.error('Error fetching progress data:', error);

    }
  };

    const fetchTopicsData = async () => {
    try {
      if (studentId) {
        const response = await fetch(`http://localhost:3001/api/topics/getTopicsBasedOnSyllabusId/${syllabus_id}`);
        const data = await response.json();
        setTopicData(data);
      }
    } catch (error) {
      console.error('Error fetching topics data:', error);
    }
  };
  useEffect(()=>{
    fetchTopicsData();
    fetchTopicProgressData();
  }, [syllabus_id]);

    // Calculate progress for a specific topic
    const calculateTopicProgress = (topic_name) => {
      console.log(topic_name);
     console.log(TopicProgressData)
      const topicProgressInProgress = TopicProgressData?.find((item) => item.topicName === topic_name);
      console.log(topicProgressInProgress);
      // const percentage = parseInt(sumCurrQuestion) / parseInt(totalQuestions);
      // console.log(percentage);
      // const finalPercentage = percentage * 100;
      // console.log(finalPercentage);
      // // const topic_id_in_progress = topicProgress?.id;
      // if(!topicProgressInProgress) return 0;  
      // if(topicProgressInProgress && percentage !== 0 ){
      //   console.log(`topicProgress is ${finalPercentage}`);
      //   return 0;
      // }
      // return finalPercentage;
     return 100;
      }

  return (
    <>
    {!TopicProgressData || TopicProgressData.length === 0 ? (
      <div><h4>Start Learning to show your progress!!</h4></div>
    ) : (
      <div className="flex justify-center items-center w-full h-full md:flex-col md:items-start">
        <div>
          <FaSquare className="text-green-500" />
          <span>Level 1</span>
          <FaSquare className="text-yellow-300" />
          <span>Level 2</span>
          {/* <FaSquare className="text-gray-500" />
          <span>Level 3</span> */}
        </div>
        {TopicData?.map((topic) => (
          <TopicProgress
            key={topic.id}
            syllabus_id={syllabus_id}
            studentId={studentId}
            topic={topic}
            topicProgress={TopicProgressData}
            calculateTopicProgress={calculateTopicProgress}
          />
        ))}
      </div>
    )}
    </>
  );
};

export default TopicsPie;