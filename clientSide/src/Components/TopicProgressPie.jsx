import React, { useState, useEffect } from 'react';
import { CircularProgressbarWithChildren, CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useAuth } from '../Components/Login/AuthContext';
import TopicProgress from './TopicProgress';
import { FaSquare } from "react-icons/fa6";

const TopicProgressPie = ({ syllabus_id  ,language_id ,languageName}) => {
    const [TopicData, setTopicData] = useState([]);
    const [TopicProgressData, setTopicProgressData] = useState([]);
    const { userData } = useAuth();
    const studentId = userData?.id;
    const [percentage, setPercentage] = useState(0);
  
    const fetchTopicProgressData = async () => {
      try {
        if (studentId) {
          const response = await fetch(`http://localhost:3001/api/progress/getTopicProgress/${studentId}/${syllabus_id}/${language_id}`);
          const data = await response.json();
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
  
    useEffect(() => {
      fetchTopicsData();
      fetchTopicProgressData();
    }, [language_id]);
  
    useEffect(() => {
      if (TopicProgressData.length > 0 && TopicData.length > 0) {
        const completedTopics = TopicProgressData.filter(item => item.completed === 1).length;
        const totalTopics = TopicData.length;
        const completedPercentage = (completedTopics / totalTopics) * 100;
        setPercentage(completedPercentage);
      }
    }, [TopicData, TopicProgressData]);
  
    return (
      <>
       {!TopicProgressData || TopicProgressData.length === 0 ? (
  <div><h4>Start Learning to show your progress!!</h4></div>
) : (
  <div className="flex w-full h-full items-center md:flex-row md:items-start gap-4">
  <div className="flex items-center overflow-x-auto w-32 h-32 ">
    <CircularProgressbar
      value={percentage}
      strokeWidth={10}
      text={percentage === 0 ? "You still didn't complete any topic" : `${parseInt(percentage)}%`}
      styles={buildStyles({
        rotation: 0.5 + (1 - percentage / 100) / 2,
        textSize: "20px"
      })}
    />
    </div>
    <h4>  of {languageName} topics</h4>
  </div>
)}

      </>
    );
  };

export default TopicProgressPie;