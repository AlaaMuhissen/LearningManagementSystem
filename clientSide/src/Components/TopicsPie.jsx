import React, { useState, useEffect } from 'react';
import { CircularProgressbarWithChildren, CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useAuth } from '../Components/Login/AuthContext';
import TopicProgress from './TopicProgress';
import { FaSquare } from "react-icons/fa6";


// const TopicsPie = ({ syllabus_id }) => {
//   const [TopicData, setTopicData] = useState([]);
//   const [TopicProgressData, setTopicProgressData] = useState([]);
//   const [LevelProgressData, setLevelProgressData] = useState([]);
//   const [LevelData, setLevelData] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [per , setPer] = useState(100);


//   const { userData } = useAuth();
//   const studentId = userData?.id;
//   let sumCurrQuestion = 0;
//   let totalQuestions = 0;

//   const fetchTopicsData = async () => {
//     try {
//       if (studentId) {
//         const response = await fetch(`http://localhost:3001/api/topics/getTopicsBasedOnSyllabusId/${syllabus_id}`);
//         const data = await response.json();
//         setTopicData(data);
//         setIsLoading(false);
//       }
//     } catch (error) {
//       console.error('Error fetching topics data:', error);
//       setIsLoading(false);
//     }
//   };

//   const fetchLevelsProgressData = async (topic_id ) => {
//     try {
//       if (studentId) {
//         const response = await fetch(`http://localhost:3001/api/progress/getLevelProgress/${studentId}/${syllabus_id}/${topic_id}`);
//         const data = await response.json();
//         setLevelProgressData(data);
//         setIsLoading(false);
//       }
//     } catch (error) {
//       console.error('Error fetching progress data:', error);
//       setIsLoading(false);
//     }
//   };
//   const fetchLevelData = async (language_name , topic_name) => {
//     try {
//       if (studentId) {
//         const response = await fetch(`http://localhost:3001/api/topics/getLevelAndQuestionNumForTopic/${syllabus_id}/${language_name}/${topic_name}`);
//         const data = await response.json();
//         console.log(data)
//         setLevelData(data);
//         setIsLoading(false);
//       }
//     } catch (error) {
//       console.error('Error fetching progress data:', error);
//       setIsLoading(false);
//     }
//   };

//   const fetchTopicProgressData = async () => {
//     try {
//       if (studentId) {
//         const response = await fetch(`http://localhost:3001/api/progress/getTopicProgress/${studentId}`);
//         const data = await response.json();
//         setTopicProgressData(data);
//         setIsLoading(false);
//       }
//     } catch (error) {
//       console.error('Error fetching progress data:', error);
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchTopicsData();
//     fetchTopicProgressData();
//     fetchLevelsProgressData(37);
//     fetchLevelData("html", "Basic_HTML_Structure");
//   }, [syllabus_id]);

//   const calculateLevelProgress = (topic_id_in_progress ,id, levelNum) => {

//     const levelProgress = LevelProgressData.find((item) => (item.topic_id === topic_id_in_progress) && (item.level_id === levelNum));
//     const level = LevelData.find((item) => (item.topic_id === id) && (item.current_Level === levelNum));
   
//     if (!levelProgress || !level) return 0;
//     else{

//       sumCurrQuestion += parseInt(levelProgress?.currQuestion) +1;
//       totalQuestions += parseInt(level?.questionsNum);
//       console.log(`level = ${levelNum}`);
//       console.log(levelProgress);
//       console.log(`level progress = ${(levelProgress?.currQuestion +1) / level?.questionsNum}`);
//        return (levelProgress?.currQuestion +1 / level?.questionsNum ) * 100;
//   }
  
  
// };
//   // Calculate progress for a specific topic
//   const calculateTopicProgress = (topic_name) => {
//     // console.log(topic_name);
//     // console.log(TopicProgressData)
//     const topicProgress = TopicProgressData?.find((item) => item.topicName === topic_name);
    
//     const percentage = parseInt(sumCurrQuestion) / parseInt(totalQuestions);
//     console.log(percentage);
//     const finalPercentage = percentage * 100;
//     console.log(finalPercentage);
//     // const topic_id_in_progress = topicProgress?.id;
//     if(!topicProgress) return 0;  
//     if(topicProgress && percentage !== 0 ){
//       console.log(`topicProgress is ${finalPercentage}`);
//       return 0;
//     }
//     return finalPercentage;
   
//     }
    
//     return (
//       <div className="flex justify-center items-center border border-black w-full h-full md:flex-col md:items-start">
//         {TopicData?.map((topic, index) => (
//           <CircularProgressbarWithChildren
//             key={topic.id}
//             value={per && parseFloat(calculateTopicProgress(topic.topic_name))}
//             text={`l=${index+1}`}
//             strokeWidth={8}
//             styles={buildStyles({
//               pathColor: "red",
//               trailColor: "transparent"
//             })}
//           >
           
//             { [...Array(topic.levelNum).keys()].map((level, i) => {
//               const colors = ["green" , "yellow" , "blue" ]     
//               const widthPercentage = `${90 - (i * 20)}%`; 
    
//               return (
//                 <div
//                   key={i}
//                   style={{
//                     position: "absolute",
//                     width: widthPercentage,
//                   }}
//                 >
//                   <CircularProgressbar
//                     value={calculateLevelProgress(37, topic.id, i + 1)}
//                     text={`${i + 1}`}
//                     styles={buildStyles({
//                       pathColor: colors[i],
//                       trailColor: "transparent"
//                     })}
//                   />
//                 </div>
//               );
//             })
//             }
//           </CircularProgressbarWithChildren>
//         ))}
//       </div>
//     );
    
    
//     };


// export default TopicsPie;



const TopicsPie = ({ syllabus_id }) => {

    const [TopicData, setTopicData] = useState([]);
    const [TopicProgressData, setTopicProgressData] = useState([]);
    const { userData } = useAuth();
    const studentId = userData?.id;


    const fetchTopicProgressData = async () => {
    try {
      if (studentId) {
        const response = await fetch(`http://localhost:3001/api/progress/getTopicProgress/${studentId}`);
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
  useEffect(()=>{
    fetchTopicsData();
    fetchTopicProgressData();
  }, [syllabus_id]);

    // Calculate progress for a specific topic
    const calculateTopicProgress = (topic_name) => {
      // console.log(topic_name);
      // // console.log(TopicProgressData)
      // const topicProgressInProgress = TopicProgressData?.find((item) => item.topicName === topic_name);
      
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
    <div className="flex justify-center items-center border border-black w-full h-full md:flex-col md:items-start">
        <div >
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
  );
};

export default TopicsPie;