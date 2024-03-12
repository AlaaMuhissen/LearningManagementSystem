import React, { useEffect, useState } from 'react';
import 'chart.js/auto';
import { Chart } from 'react-chartjs-2';
import { useAuth } from '../Components/Login/AuthContext';
import TopicsPie from '../Components/TopicsPie';
import TopicProgressPie from '../Components/TopicProgressPie';
import LanguagePie from '../Components/LanguagePie';
import { useSyllabus } from '../Components/SyllabusContext';
import { FaSquare } from "react-icons/fa6";


export const ShowProgress = () => {
  const syllabus = useSyllabus();
  const[isThereProgress , setIsThereProgress] = useState(false);
  const {userData} = useAuth();
  const studentId = userData?.id;
  useEffect(()=>{
    if (studentId) {
     fetch(`http://localhost:3001/api/progress/ifThereIsStatus/${studentId}/${1}`)
     .then(res => res.json())
     .then(data => {
      setIsThereProgress(data);
     })
    }
  },[]);
 return ( 
 <>
 {isThereProgress? (
    <div className="flex flex-col md:flex-row p-4 gap-8">
    <div className="flex flex-col gap-8 md:gap-10">
      <div className="flex flex-col items-center justify-center border-2 border-pink-600 rounded-lg p-4 shadow-lg bg-gradient-to-br from-pink-500 to-pink-700 text-white md:min-w-96">
      <h2 className="text-base md:text-xl font-bold mb-4">Language Pie Chart</h2>
      <div className="flex flex-wrap w-full justify-center items-center">
        <LanguagePie syllabus_id={1} language_id={1} />
      </div>
    </div>

    <div className="flex flex-col items-center justify-center border-2 border-pink-600 rounded-lg p-4 shadow-lg backdrop-filter backdrop-blur-lg bg-opacity-50 bg-pink-700 text-white md:min-w-96">
      <h2 className="text-base md:text-xl font-bold mb-4">Topics Pie Chart</h2>
      <div className="flex w-full  overflow-x-auto md:overflow-x-hidden gap-16 ">
        {syllabus?.map((lan, index) => (
          <TopicProgressPie syllabus_id={1} language_id={lan.language_id} languageName={lan.lanName} key={index} />
          
        ))}
      </div>
    </div>
    </div>
    <div className="h-full flex flex-col items-center justify-center border-2 border-pink-600 rounded-lg p-4 shadow-lg bg-gradient-to-br from-pink-500 to-pink-700 text-white">
      <h2 className="text-base md:text-xl font-bold mb-4">Levels Pie Chart</h2>
      <div className="flex items-center justify-center mb-4 md:mb-0 md:mr-8">
          <div className="flex items-center justify-center gap-1">
            <FaSquare className="text-green-500  text-xs" />
            <span className="text-white text-xs">Level 1</span>
            <FaSquare className="text-yellow-300 text-xs" />
            <span className="text-white text-xs">Level 2</span>
            <FaSquare className="text-gray-500 text-xs" />
            <span className="text-white text-xs ">Level 3</span>
          </div>
        </div>
      <div className="flex w-full h-full md:w-48 overflow-x-auto gap-7 mr-4 ml-4">
        {syllabus?.map((lan, index) => (
          <TopicsPie syllabus_id={1} language_id={lan.language_id} key={index}/>
        ))}
      </div>


      </div>
    </div>

  ):  <div className="flex justify-center items-center w-full h-full">
  <h4 className="text-lg font-bold text-white">Start Learning to show your progress!!</h4>
</div>}
  </>
  )
}

// const ShowProgress = () => {
//   const [progressData, setProgressData] = useState([]);
//   const [isLoading, setIsLoading] = useState(true); // Add loading state
//   const { userData } = useAuth();
//   const studentId = userData?.id;

//   const fetchProgressData = async () => {
//     try {
//       if (studentId) {
//         const response = await fetch(`http://localhost:3001/api/progress/getLevelProgress/${studentId}`);
//         const data = await response.json();
//         setProgressData(data);
//         setIsLoading(false); // Set loading state to false after data fetching
//       }
//     } catch (error) {
//       console.error('Error fetching progress data:', error);
//       setIsLoading(false); // Set loading state to false on error
//     }
// };

// useEffect(() => {
//     fetchProgressData();
// }, [studentId]);


// // Calculate progress percentage
// const calculateProgress = () => {
//     if (progressData.length === 0) return 0;
//     // Calculate total completed levels
//     const totalCompleted = progressData.reduce((acc, level) => acc + level.completed, 0);
//     // Calculate total levels
//     const totalLevels = progressData.length;
//     // Calculate progress percentage
//     const progressPercentage = (totalCompleted / totalLevels) * 100;
//     return progressPercentage.toFixed(2); // Round to 2 decimal places
// };

// // Chart data
// const chartData = {
//   labels: ['Completed', 'Remaining'],
//   datasets: [
//     {
//       data: isLoading ? [0, 100] : [calculateProgress(), 100 - calculateProgress()],
//       backgroundColor: ['#36A2EB', '#FFCE56'],
//     },
//   ],
// };
//   return (
//     <div>
//       <h2>Student Progress Chart</h2>
//       <Chart type='pie' data={chartData} />
//     </div>
//   );
// };

// export default ShowProgress;
