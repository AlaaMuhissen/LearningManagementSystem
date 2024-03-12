import React, { useState, useEffect ,useCallback } from 'react';
import { PieChart, Pie, Sector } from "recharts";
import { CircularProgressbarWithChildren, CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useAuth } from '../Components/Login/AuthContext';
import TopicProgress from './TopicProgress';
import { FaSquare } from "react-icons/fa6";
import ChangingProgressProvider from './ChangingProgressProvider';



function LanguagePie({syllabus_id  ,language_id}) {

    const [LanguageData, setLanguageData] = useState([]);
    const [LanguageProgressData, setLanguageProgressData] = useState([]);
    const [percentage, setPercentage] = useState(0);
    const { userData } = useAuth();
    const studentId = userData?.id;
   
    const[ pieData, setPieData] = useState([]);
  
   
    const fetchLanguageProgressData = async () => {
      try {
        if (studentId) {
          const response = await fetch(`http://localhost:3001/api/progress/getLanguageStatus/${studentId}/syllabus/${syllabus_id}/language/${language_id}`);
          const data = await response.json();
          setLanguageProgressData(data);
        }
      } catch (error) {
        console.error('Error fetching progress data:', error);
      }
    };
  
    const fetchLanguageData = async () => {
      try {
        if (studentId) {
          const response = await fetch(`http://localhost:3001/api/syllabus/getLanguagesNameFromSyllabus/${syllabus_id}`);
          const data = await response.json();
          setLanguageData(data);    
        }
      } catch (error) {
        console.error('Error fetching topics data:', error);
      }
    };
  
    useEffect(() => {
      fetchLanguageData();
      fetchLanguageProgressData();
    }, [syllabus_id, language_id]);
  
    useEffect(() => {
        LanguageData?.forEach((item ,index) => {
            let progress = 0;
                if(LanguageProgressData[index] !== undefined){
                    const lanProgress = LanguageProgressData[index];
                    if(lanProgress.started === 1){
                        progress = 10;
                    }
                    if(lanProgress.finished === 1){
                        progress= 100;
                    }
                }
                let data = {
                    name: item.lanName,
                    value: progress,
                    color: "red"
                }
                setPieData(pieData => [...pieData, data]);
            })
      }, [LanguageProgressData]);
  return (
   
    <>
   <div className='flex flex-wrap justify-center gap-4 '>
{console.log(pieData)}
    {pieData?.map((lan, index) => ( 
  <div key={index} className="w-20 h-20 text-center mb-8 relative">
  <div className="absolute bottom-0 left-0 w-full">
    <h4 className="text-base font-bold">{lan.name}</h4>
  </div>
  <div className="relative mx-auto ">
    <ChangingProgressProvider values={[0, 20, 80]}>
      {value => (
        <CircularProgressbar
          value={lan.value}
          text={`${lan.value}%`}
          circleRatio={0.75}
          strokeWidth={8}
          styles={buildStyles({
            rotation: 1 / 2 + 1 / 8,
            strokeLinecap: "butt",
            trailColor: "#eee",
            textColor: "#fff",
            // pathColor: `rgba(255, 76, 183, ${value / 100})`,
            trail: {
              strokeWidth: 8,
              strokeLinecap: "butt",
              stroke: "#f4f4f4",
            },
            path: {
              strokeWidth: 8,
              strokeLinecap: "butt",
            },
            text: {
              fontWeight: "bolder", 
            },
          })}
        />
      )}
    </ChangingProgressProvider>
  </div>
</div>


    ))}
    </div>
    </>
  )
}

export default LanguagePie



// const renderActiveShape = (props) => {
//     const RADIAN = Math.PI / 180;
//     const {
//       cx,
//       cy,
//       midAngle,
//       innerRadius,
//       outerRadius,
//       startAngle,
//       endAngle,
//       fill,
//       payload,
//       percent,
//       value
//     } = props;
//     const sin = Math.sin(-RADIAN * midAngle);
//     const cos = Math.cos(-RADIAN * midAngle);
//     const sx = cx + (outerRadius + 10) * cos;
//     const sy = cy + (outerRadius + 10) * sin;
//     const mx = cx + (outerRadius + 30) * cos;
//     const my = cy + (outerRadius + 30) * sin;
//     const ex = mx + (cos >= 0 ? 1 : -1) * 22;
//     const ey = my;
//     const textAnchor = cos >= 0 ? "start" : "end";
  
//     return (
//       <g>
//         <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
//           {payload.name}
//         </text>
//         <Sector
//           cx={cx}
//           cy={cy}
//           innerRadius={innerRadius}
//           outerRadius={outerRadius}
//           startAngle={startAngle}
//           endAngle={endAngle}
//           fill={fill}
//         />
//         <Sector
//           cx={cx}
//           cy={cy}
//           startAngle={startAngle}
//           endAngle={endAngle}
//           innerRadius={outerRadius + 6}
//           outerRadius={outerRadius + 10}
//           fill={fill}
//         />
//         <path
//           d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
//           stroke={fill}
//           fill="none"
//         />
//         <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
//         <text
//           x={ex + (cos >= 0 ? 1 : -1) * 12}
//           y={ey}
//           textAnchor={textAnchor}
//           fill="#333"
//         >{`PV ${value}`}</text>
//         <text
//           x={ex + (cos >= 0 ? 1 : -1) * 12}
//           y={ey}
//           dy={18}
//           textAnchor={textAnchor}
//           fill="#999"
//         >
//           {`(Rate ${(percent * 100).toFixed(2)}%)`}
//         </text>
//       </g>
//     );
//   };

//   const LanguagePie = ({ syllabus_id, language_id }) => {
//     const [LanguageData, setLanguageData] = useState([]);
//     const [LanguageProgressData, setLanguageProgressData] = useState([]);
//     const [percentage, setPercentage] = useState(0);
//     const { userData } = useAuth();
//     const studentId = userData?.id;
//     const [activeIndex, setActiveIndex] = useState(0);
//     const[ pieData, setPieData] = useState([]);
  
//     const onPieEnter = useCallback((_, index) => {
//       setActiveIndex(index);
//     }, [setActiveIndex]);
  
//     const fetchLanguageProgressData = async () => {
//       try {
//         if (studentId) {
//           const response = await fetch(`http://localhost:3001/api/progress/getLanguageStatus/${studentId}/syllabus/${syllabus_id}/language/${language_id}`);
//           const data = await response.json();
//           setLanguageProgressData(data);
//         }
//       } catch (error) {
//         console.error('Error fetching progress data:', error);
//       }
//     };
  
//     const fetchLanguageData = async () => {
//       try {
//         if (studentId) {
//           const response = await fetch(`http://localhost:3001/api/syllabus/getLanguagesNameFromSyllabus/${syllabus_id}`);
//           const data = await response.json();
//           setLanguageData(data);    
//         }
//       } catch (error) {
//         console.error('Error fetching topics data:', error);
//       }
//     };
  
//     useEffect(() => {
//       fetchLanguageData();
//       fetchLanguageProgressData();
//     }, [syllabus_id, language_id]);
  
//     useEffect(() => {

//         LanguageData.forEach((item ,index) => {
//             let progress = 2;
//             console.log(item);
//             console.log(LanguageProgressData)
//                 if(LanguageProgressData[index] !== undefined){
//                     const lanProgress = LanguageProgressData[index];
                   
//                     if(lanProgress.finished === 1){
//                         progress+= 100;
//                     }
//                     if(lanProgress.started === 1){
//                         console.log("started");
//                         progress+= 30;
//                     }
//                 }
//                 let data = {
//                     name: item.lanName,
//                     value: progress,
//                     color: "red"
//                 }
//                 setPieData(pieData => [...pieData, data]);
//             })
//       }, [LanguageProgressData]);
      
//     return (
//       <>
//       {console.log(pieData)}
//       {console.log(pieData.length)}
//         {pieData.length !== 0 &&<PieChart width={400} height={400}>
//           <Pie
//             activeIndex={activeIndex}
//             data={pieData}
//             cx={200}
//             cy={200}
//             innerRadius={60}
//             outerRadius={80}
//             fill="#8884d8"
//             dataKey="value"
//             onMouseEnter={onPieEnter}
//           />
//         </PieChart>
//   }
//       </>
//     );
//   };

// export default LanguagePie;