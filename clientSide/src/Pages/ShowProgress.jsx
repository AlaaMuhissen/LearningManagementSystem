import React, { useEffect, useState } from 'react';
import 'chart.js/auto';
import { Chart } from 'react-chartjs-2';
import { useAuth } from '../Components/Login/AuthContext';
import TopicsPie from '../Components/TopicsPie';


export const ShowProgress = () => {
 return( 
 <>
    <TopicsPie syllabus_id= {1} />
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
